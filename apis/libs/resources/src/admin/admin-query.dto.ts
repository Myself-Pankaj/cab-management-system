import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminPageQueryDto {
  @ApiPropertyOptional({ type: Number, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
  @ApiPropertyOptional({ type: Number, default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  offset: number = 0;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
export class AdminUsersQueryDto extends AdminPageQueryDto {
  @ApiPropertyOptional({ enum: ['Driver', 'Passenger', 'Admin', 'UNSELECTED'] })
  @IsOptional()
  @IsIn(['Driver', 'Passenger', 'Admin', 'UNSELECTED'])
  role?: string;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  accountStatus?: string;
}
export class AdminApplicationsQueryDto extends AdminPageQueryDto {
  @ApiPropertyOptional({
    enum: [
      'DRAFT',
      'PENDING_VERIFICATION',
      'REJECTED',
      'CORRECTION_REQUESTED',
      'APPROVED',
    ],
  })
  @IsOptional()
  @IsIn([
    'DRAFT',
    'PENDING_VERIFICATION',
    'REJECTED',
    'CORRECTION_REQUESTED',
    'APPROVED',
  ])
  state?: string;
}
export class AdminVehiclesQueryDto extends AdminPageQueryDto {
  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  activity?: string;
  @ApiPropertyOptional({
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  @IsOptional()
  @IsIn(['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'])
  category?: string;
}
export class AdminPaymentsQueryDto extends AdminPageQueryDto {
  @ApiPropertyOptional({
    enum: [
      'CREATED',
      'PENDING',
      'PAID',
      'FAILED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
      'CANCELLED',
    ],
  })
  @IsOptional()
  @IsIn([
    'CREATED',
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'CANCELLED',
  ])
  status?:
    | 'CREATED'
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'CANCELLED';
  @ApiPropertyOptional({ enum: ['ONLINE', 'OFFLINE'] })
  @IsOptional()
  @IsIn(['ONLINE', 'OFFLINE'])
  paymentType?: 'ONLINE' | 'OFFLINE';
  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Inclusive creation timestamp',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;
  @ApiPropertyOptional({
    format: 'date-time',
    description: 'Exclusive creation timestamp',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
