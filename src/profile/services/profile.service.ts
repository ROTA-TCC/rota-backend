import { Injectable } from '@nestjs/common';
import { UpdateProfileUseCase } from '../use-cases/update-profile.use-case';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(userId, data);
  }
}
