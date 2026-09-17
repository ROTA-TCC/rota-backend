import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async monitorLogin(userId: string, userAgent: string, email: string): Promise<void> {
    const fingerprint = this.generateFingerprint(userAgent);

    const device = await this.prisma.knownDevice.findUnique({
      where: {
        userId_deviceFingerprint: { userId, deviceFingerprint: fingerprint },
      },
    });

    if (!device) {
      await this.handleNewDevice(userId, fingerprint, email);
    } else {
      await this.prisma.knownDevice.update({
        where: { id: device.id },
        data: { lastUsed: new Date() },
      });
    }
  }

  private generateFingerprint(userAgent: string): string {
    return createHash('sha256').update(userAgent || '').digest('hex');
  }

  private async handleNewDevice(
    userId: string,
    fingerprint: string,
    email: string,
  ): Promise<void> {
    this.logger.warn(`Novo dispositivo detectado para o usuário ${userId}`);

    await this.prisma.knownDevice.create({
      data: { userId, deviceFingerprint: fingerprint },
    });

    try {
      await this.mailService.sendSecurityAlert(
        email,
        'Novo dispositivo detectado',
      );
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de alerta de segurança para ${email}:`, error);
    }
  }

  async logAction(
    userId: string,
    action: string,
    details: Record<string, any>,
    ip: string,
    ua: string,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: { userId, action, details, ipAddress: ip, userAgent: ua },
    });
  }
}