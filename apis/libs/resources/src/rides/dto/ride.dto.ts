import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';

export const VEHICLE_CATEGORIES = [
  'SEATER_4',
  'SEATER_5',
  'SEATER_7',
  'SEATER_12',
] as const satisfies readonly vehicle_category[];

export class RidePassengerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}

export class RideLocationDto {
  @ApiProperty()
  @IsString()
  pickup_address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickup_exact_location?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  pickup_latitude!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  pickup_longitude!: number;

  @ApiProperty()
  @IsString()
  destination_address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exact_destination?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  destination_latitude!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  destination_longitude!: number;
}

export class RideQuoteDto extends RideLocationDto {
  @ApiProperty({ enum: VEHICLE_CATEGORIES })
  @IsEnum(VEHICLE_CATEGORIES)
  vehicle_category!: vehicle_category;

  @ApiProperty({ enum: ['ONE_WAY', 'ROUND_TRIP'] })
  @IsEnum(['ONE_WAY', 'ROUND_TRIP'])
  trip_type!: 'ONE_WAY' | 'ROUND_TRIP';

  @ApiProperty()
  @IsISO8601()
  pickup_at!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  return_at?: string;

  @ApiProperty({ type: [RidePassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RidePassengerDto)
  passengers!: RidePassengerDto[];
}

export class CreateRideDto extends RideQuoteDto {
  @ApiProperty({ enum: ['ONLINE', 'OFFLINE', 'PARTIAL'] })
  @IsEnum(['ONLINE', 'OFFLINE', 'PARTIAL'])
  payment_option!: 'ONLINE' | 'OFFLINE' | 'PARTIAL';
}

export class AssignRideDto {
  @ApiProperty()
  @IsString()
  driver_profile_id!: string;

  @ApiProperty()
  @IsString()
  vehicle_id!: string;
}

export class CancelRideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  refund_required?: boolean;
}

export class UpdateRideStatusDto {
  @ApiProperty({ enum: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] })
  @IsEnum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'])
  status!: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
}

export class ListRidesQueryDto {
  @ApiPropertyOptional({ enum: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PENDING_ASSIGNMENT', 'DRIVER_ASSIGNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}

export class AdminListRidesQueryDto extends ListRidesQueryDto {
  @ApiPropertyOptional({ enum: VEHICLE_CATEGORIES })
  @IsOptional()
  @IsEnum(VEHICLE_CATEGORIES)
  category?: vehicle_category;
}
