import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../../users/services/users.service';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PasswordResetRequestedEvent } from '../events/password-reset-requested.event';
import { nanoid } from 'nanoid';

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
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    await this.passwordResetRepository.create(user.id, token, expiresAt);

    this.eventEmitter.emit(
      'password.reset.requested',
      new PasswordResetRequestedEvent(user.email, token, requestId),
    );
  }
}
