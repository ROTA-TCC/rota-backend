import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { SessionService } from '../services/session.service';
import { AuthMapper } from '../mappers/auth.mapper';
import { TwoFactorService } from '../services/two-factor.service';

import { 
  LoginDto, 
  AuthenticatedUser, 
  AuthRefreshResponse 
} from '@ROTA-TCC/types';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly sessionService: SessionService,
    private readonly authMapper: AuthMapper,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async login(credentials: LoginDto, ipAddress: string, userAgent: string) {
    const authResult = await this.loginUserUseCase.execute(
      credentials,
      ipAddress,
      userAgent,
    );

    if (authResult.requires2fa) {
      return {
        requires2fa: true,
        partialToken: authResult.partialToken,
      };
    }

    // Assertion 'as any' para permitir leitura segura de 'user' no retorno da UseCase
    const user = (authResult as any).user;
    const session = await this.sessionService.create(
      user.id,
      ipAddress,
      userAgent,
      !!credentials.rememberMe,
      user.role,
      user.isVerified,
    );

    const response = this.authMapper.toAuthResponse(
      user as AuthenticatedUser,
      session,
    );

    return { ...response, message: 'Login successful' };
  }

  async refresh(
    token: string,
    userAgent: string,
  ): Promise<AuthRefreshResponse> {
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const response = await this.sessionService.refresh(token, userAgent);

    return {
      ...response,
      user: this.authMapper.toUserResponse(response.user),
    };
  }

  async logout(token: string) {
    if (token) {
      await this.sessionService.revokeSession(token, '');
    }
    return { message: 'Logged out successfully' };
  }

  async verify2fa(
    partialToken: string,
    code: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const twoFactorServiceAny = this.twoFactorService as any;
    const user = await twoFactorServiceAny.verifyPartialToken(partialToken);
    await twoFactorServiceAny.validateCode(user.id, code);

    const session = await this.sessionService.create(
      user.id,
      ipAddress,
      userAgent,
      false,
      user.role,
      user.isVerified,
    );

    const response = this.authMapper.toAuthResponse(
      user as AuthenticatedUser,
      session,
    );

    return { ...response, message: '2FA verification successful' };
  }
}
