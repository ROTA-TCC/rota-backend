import { Injectable, BadRequestException } from '@nestjs/common';
import { Plan, TransactionType } from '../../drizzle/schema';
import type { CreateCheckoutDto } from '@ROTA-TCC/types';

const PLAN_PRICES = {
  GRATIS: 0,
  PRO: 4990,
};

export interface PaymentDetails {
  amount: number;
  productName: string;
  externalId: string;
}

@Injectable()
export class PaymentCalculatorService {
  calculate(dto: CreateCheckoutDto): PaymentDetails {
    if (dto.type === 'PLAN_SUBSCRIPTION') {
      if (!dto.plan) {
        throw new BadRequestException('Plano não informado para assinatura');
      }
      return {
        amount: PLAN_PRICES[dto.plan as Plan],
        productName: `Plano ${dto.plan}`,
        externalId: dto.plan,
      };
    }

    throw new BadRequestException('Tipo de transação inválido');
  }
}
