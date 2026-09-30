import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SecurityService } from './services/security.service';
import { SessionService } from './services/session.service';
import { SessionRepository } from './repositories/session.repository';
import { AuthController } from './controllers/auth.controller';
import { PasswordController } from './controllers/password.controller';
import { SecurityController } from './controllers/security.controller';
import { SessionController } from './controllers/session.controller';
import { ConfigController } from './controllers/config.controller';
import { UsersModule } from '../users/users.module';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { TwoFactorService } from './services/two-factor.service';
import { DeviceMonitorService } from './services/device-monitor.service';
import { TwoFactorStrategyRegistry } from './services/two-factor-strategy.registry';
import { EmailTwoFactorStrategy } from './strategies/two-factor/email.strategy';
import { MailModule } from '../mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { AuthFacade } from './services/auth.facade';
import { AccountFacade } from './services/account.facade';
import { SecurityFacade } from './services/security.facade';
import { AuthMapper } from './mappers/auth.mapper';
import { AuthListener } from './listeners/auth.listener';

import { RegisterUserUseCase } from './use-cases/register-user.use-case';
import { LoginUserUseCase } from './use-cases/login-user.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { VerifyTwoFactorUseCase } from './use-cases/verify-2fa.use-case';

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [
    AuthController,
    PasswordController,
    SecurityController,
    SessionController,
    ConfigController,
  ],
  providers: [
    AuthFacade,
    AccountFacade,
    SecurityFacade,
    AuthMapper,
    AuthListener,
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyEmailUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    VerifyTwoFactorUseCase,
    SessionService,
    SessionRepository,
    SecurityService,
    PasswordResetRepository,
    TwoFactorService,
    DeviceMonitorService,
    TwoFactorStrategyRegistry,
    EmailTwoFactorStrategy,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    AuthFacade,
    AccountFacade,
    SecurityFacade,
    AuthMapper,
    JwtAuthGuard,
    TwoFactorService,
  ],
})
export class AuthModule {}
