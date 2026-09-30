import { Injectable } from '@nestjs/common';
import { RunsRepository } from '../repositories/runs.repository';
import { CreateRunDto } from '../dtos/create-run.dto';

@Injectable()
export class CreateRunUseCase {
  constructor(private readonly runsRepository: RunsRepository) {}

  async execute(userId: string, dto: CreateRunDto) {
    const km = dto.distance_meters / 1000;
    const minutes = dto.duration_seconds / 60;
    const averagePace = km > 0 ? minutes / km : 0;

    return this.runsRepository.create({
      userId,
      startTime: new Date(dto.start_time),
      endTime: new Date(dto.end_time),
      durationSeconds: dto.duration_seconds,
      distanceMeters: dto.distance_meters,
      averagePace,
      calories: dto.calories,
    });
  }
}
