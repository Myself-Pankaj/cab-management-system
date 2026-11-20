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
  Min,
  Max,
  IsInt,
  IsUUID,
  IsUrl,
  MinLength,
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
  @Min(-90)
  @Max(90)
  pickup_latitude!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
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
  @Min(-90)
  @Max(90)
  destination_latitude!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  destination_longitude!: number;
}

export class RideEstimateDto extends RideLocationDto {
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
}

export class RideQuoteDto extends RideEstimateDto {
  @ApiProperty({ enum: VEHICLE_CATEGORIES })
  @IsEnum(VEHICLE_CATEGORIES)
  vehicle_category!: vehicle_category;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  bag_count?: number;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  special_requests?: string;

  @ApiProperty({ type: [RidePassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RidePassengerDto)
  passengers!: RidePassengerDto[];
}

export class CreateRideDto extends RideQuoteDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  booking_key?: string;

  @ApiPropertyOptional({
    minimum: 0,
    description: 'Fare last approved by the passenger',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  accepted_fare_inr?: number;

  @ApiProperty({ enum: ['ONLINE', 'OFFLINE', 'PARTIAL'] })
  @IsEnum(['ONLINE', 'OFFLINE', 'PARTIAL'])
  payment_option!: 'ONLINE' | 'OFFLINE' | 'PARTIAL';
}

export class AssignRideDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiProperty() @IsString() @MaxLength(1000) reason!: string;
  @ApiProperty()
  @IsString()
  driver_profile_id!: string;

  @ApiProperty()
  @IsString()
  vehicle_id!: string;
}

export class CancelRideDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
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
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
  @ApiProperty({ enum: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] })
  @IsEnum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'])
  status!: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const RIDE_STATUSES = [
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'PENDING_ASSIGNMENT',
  'DRIVER_ASSIGNED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export class ListRidesQueryDto {
  @ApiPropertyOptional({ enum: RIDE_STATUSES })
  @IsOptional()
  @IsEnum(RIDE_STATUSES)
  status?: (typeof RIDE_STATUSES)[number];

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0, maximum: 2147483647 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  offset?: number;
}

export class ListPassengerRidesQueryDto extends ListRidesQueryDto {
  @ApiPropertyOptional({
    enum: ['upcoming', 'completed'],
    description:
      'Upcoming contains active rides. Completed contains completed and cancelled rides.',
  })
  @IsOptional()
  @IsEnum(['upcoming', 'completed'])
  view?: 'upcoming' | 'completed';
}

export class AdminListRidesQueryDto extends ListRidesQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  driverProfileId?: string;
  @ApiPropertyOptional({ enum: ['assigned', 'completed'] })
  @IsOptional()
  @IsEnum(['assigned', 'completed'])
  view?: 'assigned' | 'completed';
  @ApiPropertyOptional({ enum: VEHICLE_CATEGORIES })
  @IsOptional()
  @IsEnum(VEHICLE_CATEGORIES)
  category?: vehicle_category;
}

export class UpdateCabCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  display_name!: string;
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description!: string;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  image_url?: string | null;
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(30)
  bag_capacity!: number;
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  base_fare_inr!: number;
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  per_km_rate_inr!: number;
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  min_fare_inr!: number;
  @ApiProperty()
  @IsBoolean()
  is_active!: boolean;
}

export class VerifyRidePaymentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  razorpay_order_id!: string;
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  razorpay_payment_id!: string;
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  razorpay_signature!: string;
}
