import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { VerifyTwoFactorUseCase } from '../use-cases/verify-2fa.use-case';
import { SessionService } from './session.service';
import { LoginDto } from '@ROTA-TCC/types';
import { AuthenticatedUser } from '@ROTA-TCC/types';
import { AuthMapper } from '../mappers/auth.mapper';
import {
  AuthLoginResponse,
  AuthRefreshResponse,
  AuthVerify2faResponse,
} from '@ROTA-TCC/types';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly sessionService: SessionService,
    private readonly authMapper: AuthMapper,
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
    
    return {
      requires2fa: false,
      accessToken: authResult.accessToken,
    };
  }
  
  const user = authResult.user!;
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
): Promise < AuthRefreshResponse > {
  if (!token) {
    throw new UnauthorizedException('Token ausente');
  }
  const response = await this.sessionService.refresh(token, userAgent);
  return {
    ...response,
    user: this.authMapper.toUserResponse(response.user),
    message: 'Token refreshed successfully',
  };
}

async logout(token: string) {
  if (token) {
    await this.sessionService.revokeSession(token, '');
  }
  return {
    clearCookie: true,
    message: 'Logged out successfully',
  };
}

async verify2fa(
  partialToken: string,
  code: string,
  ipAddress: string,
  userAgent: string,
): Promise < AuthVerify2faResponse > {
  const user = (await this.verifyTwoFactorUseCase.execute(
    partialToken,
    code,
  )) as AuthenticatedUser;
  const session = await this.sessionService.create(
    user.id,
    ipAddress,
    userAgent,
    false,
    user.role,
    user.isVerified,
  );
  
  const response = this.authMapper.toAuthResponse(user, session);
  return { ...response, message: '2FA verification successful' };
}