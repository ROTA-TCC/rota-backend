import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from '@ROTA-TCC/types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Email } from '../../common/domain/value-objects/email.vo';
import { UserRepository } from '../repositories/user.repository';
import { UserCreatedEvent } from '../../auth/events/user-created.event';
import { nanoid } from 'nanoid';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(registrationData: RegisterDto, hashedPassword: string) {
    const email = new Email(registrationData.email);
    await this.validateUniqueness(email.toString(), registrationData.alias);

    const verificationToken = nanoid(32);
    const user = await this.repository.create({
      email: email.toString(),
      alias: registrationData.alias,
      password: hashedPassword,
      verificationToken,
    });

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.email, verificationToken),
    );

    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.repository.findByToken(token);
    if (!user) throw new NotFoundException('Invalid token');

    return this.repository.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });
  }

  async findOne(id: string) {
    return this.repository.findById(id);
  }

  async findByEmail(email: string) {
    const emailVo = new Email(email);
    return this.repository.findUniqueByEmail(emailVo.toString());
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.repository.update(userId, { password: hashedPassword });
  }

  private async validateUniqueness(email: string, alias: string) {
    const user = await this.repository.findFirstByEmailOrAlias(email, alias);
    if (!user) return;
    if (user.email === email)
      throw new ConflictException('Email already in use');
    throw new ConflictException('Alias already in use');
  }
}
