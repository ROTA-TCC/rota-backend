import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private repository: ProfileRepository) {}

  async execute(userId: string, data: UpdateProfileDto) {
    return this.repository.update(userId, data);
  }
}
