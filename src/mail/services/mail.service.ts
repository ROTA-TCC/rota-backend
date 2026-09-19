import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailOptions } from '../interfaces/mail.interfaces';
import {
  WelcomeEmailContext,
  VerifyEmailContext,
  PasswordResetContext,
  TwoFactorCodeContext,
  SecurityAlertContext,
} from '../interfaces/email-context.interfaces';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendWelcomeEmail(to: string, context: WelcomeEmailContext, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Bem-vindo ao Nosso Sistema!',
      template: 'welcome',
      context,
      requestId,
    };

    await this.mailQueue.add('welcome', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async sendVerificationEmail(to: string, context: VerifyEmailContext, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Verifique seu e-mail',
      template: 'verify-email',
      context,
      requestId,
    };

    await this.mailQueue.add('verify-email', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendPasswordResetEmail(to: string, context: PasswordResetContext, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Redefinição de Senha',
      template: 'password-reset',
      context,
      requestId,
    };

    await this.mailQueue.add('password-reset', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async send2faCode(to: string, context: TwoFactorCodeContext, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Seu código de verificação 2FA',
      template: 'two-factor-code',
      context,
      requestId,
    };

    await this.mailQueue.add('two-factor-code', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async sendSecurityAlert(to: string, context: SecurityAlertContext, requestId?: string) {
    const options: MailOptions = {
      to,
      subject: 'Alerta de Segurança',
      template: 'security-alert',
      context,
      requestId,
    };

    await this.mailQueue.add('security-alert', options, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}
