import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import type { CreateCheckoutDto } from '@ROTA-TCC/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('Pagamentos')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Cria um link de pagamento (checkout) para plano' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentService.createCheckout(userId, dto);
  }

  @ApiOperation({
    summary: 'Simula o pagamento de um checkout (apenas em modo sandbox/dev)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('simulate/:id')
  async simulatePayment(@Param('id') id: string) {
    return this.paymentService.simulatePayment(id);
  }

  @ApiOperation({
    summary: 'Webhook para recebimento de notificações do AbacatePay',
  })
  @Post('webhook')
  async handleWebhook(
    @Headers('x-abacatepay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException(
        'Raw body not found. Ensure rawBody is enabled in NestJS bootstrap.',
      );
    }

    return this.paymentService.handleWebhook(signature, req.rawBody.toString());
  }
}
