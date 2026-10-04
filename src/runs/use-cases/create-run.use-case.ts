import { Injectable } from '@nestjs/common';
import { RunsRepository } from '../repositories/runs.repository';
import { CreateRunDto } from '../dtos/create-run.dto';

@Injectable()
export class CreateRunUseCase {
  constructor(private readonly runsRepository: RunsRepository) {}

  async execute(userId: string, dto: CreateRunDto) {
    const km = dto.distanceMeters / 1000;
    const minutes = dto.durationSeconds / 60;
    const averagePace = km > 0 ? minutes / km : 0;

    return this.runsRepository.create({
      userId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      durationSeconds: dto.durationSeconds,
      distanceMeters: dto.distanceMeters,
      averagePace,
      calories: dto.calories,
    });
  }
}
