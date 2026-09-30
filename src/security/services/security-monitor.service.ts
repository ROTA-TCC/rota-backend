import { Injectable, Logger, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { MailService } from '../../mail/services/mail.service';
import * as schema from '../../drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  constructor(
    private readonly mailService: MailService,
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async monitorLogin(userId: string, userAgent: string, email: string): Promise<void> {
    const fingerprint = this.generateFingerprint(userAgent);

    const [device] = await this.db
      .select()
      .from(schema.knownDevice)
      .where(
        and(
          eq(schema.knownDevice.userId, userId),
          eq(schema.knownDevice.deviceFingerprint, fingerprint),
        ),
      )
      .limit(1);

    if (!device) {
      await this.handleNewDevice(userId, fingerprint, email);
    } else {
      await this.db
        .update(schema.knownDevice)
        .set({ lastUsed: new Date() })
        .where(eq(schema.knownDevice.id, device.id));
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

    await this.db.insert(schema.knownDevice).values({
      userId,
      deviceFingerprint: fingerprint,
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
    await this.db.insert(schema.auditLog).values({
      userId,
      action,
      details,
      ipAddress: ip,
      userAgent: ua,
    });
  }
}
