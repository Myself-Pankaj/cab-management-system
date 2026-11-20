import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class DriverRidesQueryDto {
  @ApiPropertyOptional({
    enum: [
      'assigned',
      'active',
      'completed',
      'cancelled',
      'rejected',
      'history',
    ],
  })
  @IsOptional()
  @IsEnum([
    'assigned',
    'active',
    'completed',
    'cancelled',
    'rejected',
    'history',
  ])
  view?:
    'assigned' | 'active' | 'completed' | 'cancelled' | 'rejected' | 'history';
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
export class OfferReasonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
export class CompleteDriverRideDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiProperty({ minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  expected_outstanding!: number;
  @ApiProperty({ minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  declared_cash!: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
export class SuspendDriverDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiProperty() @IsString() @MaxLength(1000) reason!: string;
}

export class AdminOfferReasonDto extends OfferReasonDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
}
