import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions } from '../interfaces/mail.interfaces';

@Injectable()
export class MailOrchestrator {
  private readonly logger = new Logger(MailOrchestrator.name);
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async send(options: MailOptions): Promise<void> {
    try {
      const from = this.configService.get('SMTP_FROM_EMAIL');

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: `Hello ${options.context.alias}!`,
        html:
          options.html ||
          `<strong>Bem-vindo, ${options.context.alias}!</strong>`,
      });

      this.logger.log(`Email sent successfully to ${options.to} using SMTP`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to} using SMTP: ${error.message}`,
      );
      throw new Error('Email sending failed.');
    }
  }
}
