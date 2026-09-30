import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentTestController } from './payment-test.controller';
import { AbacatePayGateway } from './gateways/abacatepay.gateway';
import { PaymentCalculatorService } from './services/payment-calculator.service';
import { PAYMENT_GATEWAY } from './interfaces/payment-gateway.interface';

@Module({
  imports: [HttpModule],
  providers: [
    PaymentService,
    PaymentCalculatorService,
    {
      provide: PAYMENT_GATEWAY,
      useClass: AbacatePayGateway,
    },
  ],
  controllers: [PaymentController, PaymentTestController],
  exports: [PaymentService],
})
export class PaymentModule {}
