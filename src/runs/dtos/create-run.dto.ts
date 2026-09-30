import { IsDateString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackpointDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @IsNumber()
  speed_mps?: number;

  @IsDateString()
  recorded_at: string;
}

export class CreateRunDto {
  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsNumber()
  @Min(1)
  duration_seconds: number;

  @IsNumber()
  @Min(0)
  distance_meters: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackpointDto)
  trackpoints: TrackpointDto[];
}
