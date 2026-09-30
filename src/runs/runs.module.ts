import { Module } from '@nestjs/common';
import { RunsController } from './controllers/runs.controller';
import { RunsRepository } from './repositories/runs.repository';
import { CreateRunUseCase } from './use-cases/create-run.use-case';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [RunsController],
  providers: [RunsRepository, CreateRunUseCase],
})
export class RunsModule {}
