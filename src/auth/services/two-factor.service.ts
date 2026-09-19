import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { TwoFactorStrategyRegistry } from './two-factor-strategy.registry';
import { DeviceMonitorService } from './device-monitor.service';

const TWO_FACTOR_EXPIRATION_MS = 5 * 60 * 1000;

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly strategyRegistry: TwoFactorStrategyRegistry,
    private readonly deviceMonitor: DeviceMonitorService,
  ) {}

  async generateAndSendCode(
    user: { id: string; email: string },
    strategyName = 'email',
  ): Promise<void> {
    const strategy = this.strategyRegistry.getStrategy(strategyName);
    const code = await strategy.generateCode(user.id);
    const expiresAt = new Date(Date.now() + TWO_FACTOR_EXPIRATION_MS);

    await this.userRepository.update2faCode(user.id, code, expiresAt);
    await strategy.sendCode(user.email, code);

    this.logger.log(`2FA code sent via ${strategyName} to ${user.email}`);
  }

  async verifyCode(
    user: {
      id: string;
      twoFactorCode: string | null;
      twoFactorExpiresAt: Date | null;
    },
    code: string,
    strategyName = 'email',
  ): Promise<boolean> {
    if (!user.twoFactorCode || !user.twoFactorExpiresAt) return false;
    if (user.twoFactorExpiresAt < new Date()) return false;

    const strategy = this.strategyRegistry.getStrategy(strategyName);
    return strategy.verifyCode(code, user.twoFactorCode);
  }

  async isNewDevice(userId: string, userAgent: string): Promise<boolean> {
    return this.deviceMonitor.isNewDevice(userId, userAgent);
  }

  async logDevice(userId: string, userAgent: string): Promise<void> {
    return this.deviceMonitor.logDevice(userId, userAgent);
  }

  async clear2faCode(userId: string): Promise<void> {
    await this.userRepository.clear2faCode(userId);
  }

  async enable(userId: string): Promise<void> {
    await this.userRepository.update(userId, { is2faEnabled: true });
  }

  async disable(userId: string): Promise<void> {
    await this.userRepository.update(userId, { is2faEnabled: false });
  }

  async findUser(userId: string) {
    return this.userRepository.findById(userId);
  }
}
