import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';

@Injectable()
export class DeviceMonitorService {
  constructor(private readonly userRepository: UserRepository) {}

  async isNewDevice(userId: string, userAgent: string): Promise<boolean> {
    const fingerprint = this.generateFingerprint(userAgent);
    const device = await this.userRepository.findKnownDevice(
      userId,
      fingerprint,
    );
    return !device;
  }

  async logDevice(userId: string, userAgent: string): Promise<void> {
    const fingerprint = this.generateFingerprint(userAgent);
    await this.userRepository.createKnownDevice(userId, fingerprint);
  }

  private generateFingerprint(userAgent: string): string {
    // Em produção, deveria ser um hash SHA-256
    return Buffer.from(userAgent).toString('base64').substring(0, 50);
  }
}
