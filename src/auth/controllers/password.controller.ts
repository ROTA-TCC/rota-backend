import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { SecurityFacade } from '../services/security.facade';
import type { ResetPasswordDto } from '@ROTA-TCC/types';
import {
  ApiTags,
  ApiOperation,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@ApiTags('Password')
@Controller('auth/password')
@UseInterceptors(TransformInterceptor)
export class PasswordController {
  constructor(private readonly securityFacade: SecurityFacade) {}

  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post('forgot')
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description: 'Envia um link com token único para o e-mail do usuário.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'user@example.com' } },
    },
  })
  @ApiOkResponse({ description: 'E-mail de recuperação enviado.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  async forgot(@Body('email') email: string) {
    return this.securityFacade.forgotPassword(email);
  }

  @Post('reset')
  @ApiOperation({
    summary: 'Redefinir senha',
    description:
      'Altera a senha do usuário utilizando o token de recuperação válido.',
  })
  @ApiOkResponse({ description: 'Senha alterada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado.' })
  async reset(@Body() resetData: ResetPasswordDto) {
    return this.securityFacade.resetPassword(
      resetData.token,
      resetData.password,
    );
  }
}
