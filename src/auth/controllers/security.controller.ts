import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { SecurityFacade } from '../services/security.facade';
import { AccountFacade } from '../services/account.facade';
import type { VerifyEmailDto } from '@ROTA-TCC/types';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SecurityStatusResponse } from '@ROTA-TCC/types';
import { UserId } from '../decorators/user-id.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@ApiTags('Security')
@Controller('auth/security')
@UseInterceptors(TransformInterceptor)
export class SecurityController {
  constructor(
    private readonly securityFacade: SecurityFacade,
    private readonly accountFacade: AccountFacade,
  ) {}

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verificar e-mail do usuário',
    description:
      'Ativa a conta do usuário através do token enviado via link no e-mail.',
  })
  @ApiOkResponse({ description: 'E-mail verificado com sucesso.' })
  @ApiBadRequestResponse({
    description: 'Token de verificação inválido ou expirado.',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.accountFacade.verifyEmail(verifyEmailDto.token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter status de segurança' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'JWT ausente ou inválido.' })
  async getStatus(@UserId() userId: string) {
    return this.securityFacade.getSecurityStatus(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar autenticação de dois fatores' })
  async enable2fa(@UserId() userId: string) {
    return this.securityFacade.enable2fa(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('2fa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar autenticação de dois fatores' })
  async disable2fa(@UserId() userId: string) {
    return this.securityFacade.disable2fa(userId);
  }
}
