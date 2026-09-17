import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  LoginDto,
  RegisterDto,
  TwoFactorVerifyDto,
  AuthResponse,
  TwoFactorRequiredResponse,
} from '@ROTA-TCC/types';
import { AuthFacade } from '../services/auth.facade';
import { AccountFacade } from '../services/account.facade';
import { SetCookieInterceptor } from '../interceptors/set-cookie.interceptor';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import { IpAddress } from '../decorators/ip-address.decorator';
import { UserAgent } from '../decorators/user-agent.decorator';

@ApiTags('Autenticação')
@Controller('auth')
@UseInterceptors(TransformInterceptor, SetCookieInterceptor)
export class AuthController {
  constructor(
    private readonly authFacade: AuthFacade,
    private readonly accountFacade: AccountFacade,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma conta de usuário com alias único, e-mail e senha.',
  })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso.' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou alias/e-mail já em uso.',
  })
  async register(@Body() registrationData: RegisterDto) {
    return this.accountFacade.register(registrationData);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Valida credenciais. Se o 2FA estiver ativo, retorna 202 com partialToken.',
  })
  @ApiOkResponse({ description: 'Login bem sucedido.', type: AuthResponse })
  @ApiResponse({
    status: 202,
    description: '2FA necessário.',
    type: TwoFactorRequiredResponse,
  })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos.' })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente em 1 minuto.',
  })
  async login(
    @Body() credentials: LoginDto,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    return this.authFacade.login(credentials, ipAddress, userAgent);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Atualizar token de acesso' })
  @ApiOkResponse({ description: 'Token atualizado com sucesso.' })
  @ApiUnauthorizedResponse({
    description: 'Refresh Token inválido ou expirado.',
  })
  async refresh(
    @RefreshToken() token: string,
    @UserAgent() userAgent: string,
  ) {
    return this.authFacade.refresh(token, userAgent);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso.' })
  async logout(@RefreshToken() token: string) {
    return this.authFacade.logout(token);
  }

  @Post('verify-2fa')
  @ApiOperation({ summary: 'Verificar código 2FA' })
  @ApiOkResponse({
    description: '2FA verificado. Sessão iniciada.',
    type: AuthResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Código inválido ou token parcial expirado.',
  })
  async verify2fa(
    @Body() verifyDto: TwoFactorVerifyDto,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    return this.authFacade.verify2fa(
      verifyDto.partialToken,
      verifyDto.code,
      ipAddress,
      userAgent,
    );
  }
}