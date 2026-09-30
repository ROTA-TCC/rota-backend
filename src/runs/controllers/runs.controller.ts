import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserId } from '../../auth/decorators/user-id.decorator';
import { CreateRunDto } from '../dtos/create-run.dto';
import { CreateRunUseCase } from '../use-cases/create-run.use-case';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly createRunUseCase: CreateRunUseCase) {}

  @Post()
  async create(@UserId() userId: string, @Body() dto: CreateRunDto) {
    const run = await this.createRunUseCase.execute(userId, dto);
    return {
      success: true,
      message: 'Corrida salva com sucesso!',
      data: run,
    };
  }
}
