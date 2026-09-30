import { IsOptional, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MapaOcultacaoDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  raio_metros: number;
}

export class UpdateProfileDto {
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
  nivel_dificuldade?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MapaOcultacaoDto)
  mapa_ocultacao?: MapaOcultacaoDto;
}
