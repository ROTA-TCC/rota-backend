import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';
import { nanoid } from 'nanoid';

const PASSWORD_RESET_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string, requestId?: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MS);

    await this.passwordResetRepository.create(user.id, token, expiresAt);

    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetRequestedEvent(
        user.email,
        user.alias,
        token,
        `https://app.example.com/reset?token=${token}`,
        requestId,
      ),
    );

  }
}
