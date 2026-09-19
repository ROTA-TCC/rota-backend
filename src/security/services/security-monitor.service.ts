import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/services/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async alertNewDevice(
    userId: string,
    fingerprint: string,
    email: string,
  ): Promise<void> {
    this.logger.warn(`Novo dispositivo detectado para o usuário ${userId}`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.prisma.knownDevice.create({
      data: { userId, deviceFingerprint: fingerprint },
    });

    await this.mailService.sendSecurityAlert(email, {
      alias: user?.alias || 'Usuário',
      alertType: 'Novo dispositivo detectado',
      timestamp: new Date().toLocaleString('pt-BR'),
      device: fingerprint,
      ipAddress: '0.0.0.0', // Necessário capturar o IP real aqui
      secureAccountUrl: 'https://seuapp.com/seguranca', // URL configurável
    });
  }

  async logAction(
    userId: string,
    action: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Ação de segurança: ${action} para usuário ${userId}`);
    await this.prisma.auditLog.create({
      data: { userId, action, metadata },
    });
  }
}
