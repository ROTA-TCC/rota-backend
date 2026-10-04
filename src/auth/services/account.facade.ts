import { Injectable } from '@nestjs/common';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { VerifyEmailUseCase } from '../use-cases/verify-email.use-case';
import type { RegisterDto } from '@ROTA-TCC/types';
import { UserMapper } from '../../users/mappers/user.mapper';

@Injectable()
export class AccountFacade {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  async register(registrationData: RegisterDto) {
    const user = await this.registerUserUseCase.execute(registrationData);
    return {
      user: this.userMapper.toResponse(user),
      message:
        'Account created successfully. Please check your email for verification.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.verifyEmailUseCase.execute(token);
    return {
      user: this.userMapper.toResponse(user),
      message: 'Email verified successfully',
    };
  }
}
