import { Controller, Post, Body, BadRequestException, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { eq } from 'drizzle-orm';

@Controller('payment-test')
export class PaymentTestController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Post('force-confirm')
  async forceConfirm(@Body('externalId') externalId: string) {
    const [transaction] = await this.db.select().from(schema.transaction).where(eq(schema.transaction.externalId, externalId));

    if (!transaction)
      throw new BadRequestException('Transação não encontrada no seu banco');

    const payload = {
      event: 'checkout.completed',
      data: { id: externalId },
    };

    const rawBody = JSON.stringify(payload);
    const secret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET');

    if (!secret) {
      throw new BadRequestException(
        'ABACATEPAY_WEBHOOK_SECRET não configurado no ambiente',
      );
    }

    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return this.paymentService.handleWebhook(signature, rawBody);
  }
}
