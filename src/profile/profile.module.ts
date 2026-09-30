import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { ProfileRepository } from './repositories/profile.repository';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, UpdateProfileUseCase],
})
export class ProfileModule {}
