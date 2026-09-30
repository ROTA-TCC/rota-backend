import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { SecurityService } from '../services/security.service';
import { Password } from '../../common/domain/value-objects/password.vo';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly securityService: SecurityService,
  ) {}

  async execute(token: string, newPassword: string) {
    const reset = await this.passwordResetRepository.findByToken(token);

    if (!reset || reset.usedAt || (reset.expiresAt && reset.expiresAt < new Date())) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const password = new Password(newPassword);
    const hash = await this.securityService.hashPassword(password.toString());

    await this.userService.updatePassword(reset.userId, hash);
    await this.passwordResetRepository.markAsUsed(reset.id);
  }
}
