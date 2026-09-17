import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('payment-test')
export class PaymentTestController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('force-confirm')
  async forceConfirm(@Body('externalId') externalId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { externalId },
    });

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
