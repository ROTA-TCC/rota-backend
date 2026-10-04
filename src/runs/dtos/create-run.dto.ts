import { IsDateString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import type { 
  CreateRunDto as CreateRunInterface, 
  TrackpointDto as TrackpointInterface 
} from '@ROTA-TCC/types';

export class TrackpointDto implements TrackpointInterface {
  @Expose({ name: 'latitude' })
  @IsNumber()
  latitude: number;

  @Expose({ name: 'longitude' })
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Expose({ name: 'altitude' })
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @Expose({ name: 'speed_mps' })
  @IsNumber()
  speedMps?: number;

  @Expose({ name: 'recorded_at' })
  @IsDateString()
  recordedAt: string;
}

export class CreateRunDto implements CreateRunInterface {
  @Expose({ name: 'start_time' })
  @IsDateString()
  startTime: string;

  @Expose({ name: 'end_time' })
  @IsDateString()
  endTime: string;

  @Expose({ name: 'duration_seconds' })
  @IsNumber()
  @Min(1)
  durationSeconds: number;

  @Expose({ name: 'distance_meters' })
  @IsNumber()
  @Min(0)
  distanceMeters: number;

  @IsOptional()
  @Expose({ name: 'calories' })
  @IsNumber()
  calories?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackpointDto)
  trackpoints: TrackpointDto[];
}
