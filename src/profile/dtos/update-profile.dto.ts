import { IsOptional, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { 
  UpdateProfileDto as UpdateProfileInterface, 
  HideoutZoneDto as HideoutZoneInterface 
} from '@ROTA-TCC/types';

export class MapaOcultacaoDto implements HideoutZoneInterface {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  radiusMetres: number;
}

export class UpdateProfileDto implements UpdateProfileInterface {
  @IsOptional()
  @IsNumber()
  peso?: number;

  @IsOptional()
  @IsNumber()
  altura?: number;

  @IsOptional()
  @IsNumber()
  idade?: number;

  @IsOptional()
  @IsString()
  nivelDificuldade?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MapaOcultacaoDto)
  mapaOcultacao?: MapaOcultacaoDto;
}
