import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly userService: UsersService) {}

  async execute(token: string) {
    return this.userService.verifyEmail(token);
  }
}
