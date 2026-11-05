import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VEHICLE_CATEGORIES } from '../../rides/dto/ride.dto.js';
import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';

export class CreateDriverVehicleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  vehicle_number!: string;

  @ApiProperty({ enum: VEHICLE_CATEGORIES })
  @IsEnum(VEHICLE_CATEGORIES)
  vehicle_type!: vehicle_category;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  @Max(2100)
  manufacturing_year?: number;
}
