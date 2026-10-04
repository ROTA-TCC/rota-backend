import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CreateCheckoutDto } from '@ROTA-TCC/types';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import { PAYMENT_GATEWAY } from './interfaces/payment-gateway.interface';
import type { IPaymentGateway } from './interfaces/payment-gateway.interface';
import { PaymentCalculatorService } from './services/payment-calculator.service';

type TransactionMetadata = {
  plan?: 'GRATIS' | 'PRO';
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly configService: ConfigService,
    private readonly calculator: PaymentCalculatorService,
  ) {}

  async createCheckout(userId: string, dto: CreateCheckoutDto) {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, userId));
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const { amount, productName, externalId } = this.calculator.calculate(dto);

    const product = await this.gateway.createProduct(
      externalId,
      productName,
      amount,
    );

    const isSubscription = dto.type === 'PLAN_SUBSCRIPTION';
    const items = [{ id: product.id, quantity: 1 }];
    const customer = {
      email: user.email,
      ...(dto.customerName ? { name: dto.customerName } : {}),
      ...(dto.taxId ? { taxId: dto.taxId } : {}),
    };
    const urls = {
      returnUrl:
        dto.returnUrl || this.configService.get<string>('APP_RETURN_URL'),
      completionUrl:
        dto.completionUrl ||
        this.configService.get<string>('APP_COMPLETION_URL'),
    };

    const checkoutData = isSubscription
      ? await this.gateway.createSubscription(items, customer, urls)
      : await this.gateway.createCheckout(items, customer, urls);

    await this.db.insert(schema.transaction).values({
        externalId: checkoutData.id,
        userId,
        amount,
        type: 'PLAN_SUBSCRIPTION',
        status: 'PENDING',
        metadata: { plan: dto.plan },
        updatedAt: new Date(),
    });

    return { url: checkoutData.url };
  }

  async simulatePayment(externalId: string) {
    try {
      await this.gateway.simulatePayment(externalId);
      return { message: 'Simulação enviada com sucesso' };
    } catch (error) {
      this.logger.error(
        'Erro ao simular pagamento',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        'Falha na simulação. Verifique se o ID existe e se você está em modo sandbox.',
      );
    }
  }

  async handleWebhook(signature: string, rawBody: string) {
    if (!this.gateway.verifyWebhook(signature, rawBody)) {
      this.logger.warn('Webhook com assinatura inválida recebido');
      throw new BadRequestException('Assinatura inválida');
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === 'checkout.completed') {
      await this.processSuccessfulPayment(data.id);
    }
  }

  private async processSuccessfulPayment(externalId: string) {
    const [transaction] = await this.db.select().from(schema.transaction).where(eq(schema.transaction.externalId, externalId));

    if (!transaction) {
      this.logger.error(`Transação ${externalId} não encontrada no banco`);
      return;
    }

    if (transaction.status === 'PAID') return;

    const metadata = transaction.metadata as TransactionMetadata;

    await this.db.transaction(async (tx) => {
      await tx.update(schema.transaction)
        .set({ status: 'PAID' })
        .where(eq(schema.transaction.id, transaction.id));

      if (transaction.type === 'PLAN_SUBSCRIPTION' && metadata.plan) {
        await tx.update(schema.users)
            .set({ plan: metadata.plan === 'PRO' ? 'PRO' : 'GRATIS' })
            .where(eq(schema.users.id, transaction.userId));
      }
    });

    this.logger.log(`Pagamento confirmado para usuário ${transaction.userId}`);
  }
}
