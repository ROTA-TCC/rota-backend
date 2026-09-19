import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../../mail/services/mail.service';
import { UserCreatedEvent } from '../events/user-created.event';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';
import { TwoFactorCodeGeneratedEvent } from '../events/two-factor-code-generated.event';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger(AuthListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    this.logger.log(
      `Handling user.created event for ${event.email} [ID: ${event.requestId || 'N/A'}]`,
    );
    try {
      await this.mailService.sendVerificationEmail(
        event.email,
        {
          alias: event.alias,
          token: event.verificationToken,
          verifyUrl: event.verifyUrl,
          expirationTime: '30 minutos',
        },
        event.requestId,
      );
    } catch (error) {
      this.logger.error(
        `Error sending verification email to ${event.email}:`,
        error,
      );
    }
  }

  @OnEvent('password.reset.requested')
  async handlePasswordResetRequestedEvent(event: PasswordResetRequestedEvent) {
    this.logger.log(
      `Handling password.reset.requested event for ${event.email} [ID: ${event.requestId || 'N/A'}]`,
    );
    try {
      await this.mailService.sendPasswordResetEmail(
        event.email,
        {
          alias: event.alias,
          token: event.token,
          resetUrl: event.resetUrl,
          expirationTime: '15 minutos',
        },
        event.requestId,
      );
    } catch (error) {
      this.logger.error(
        `Error sending password reset email to ${event.email}:`,
        error,
      );
    }
  }

  @OnEvent('two.factor.code.generated')
  async handleTwoFactorCodeGeneratedEvent(event: TwoFactorCodeGeneratedEvent) {
    this.logger.log(
      `Handling two.factor.code.generated event for ${event.email} [ID: ${event.requestId || 'N/A'}]`,
    );
    try {
      await this.mailService.send2faCode(
        event.email,
        {
          code: event.code,
          expirationTime: '5 minutos',
        },
        event.requestId,
      );
    } catch (error) {
      this.logger.error(
        `Error sending 2FA code email to ${event.email}:`,
        error,
      );
    }
  }
}
