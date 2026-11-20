import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { CreateDriverVehicleDto } from '../drivers/dto/create-driver-vehicle.dto.js';
export class AdminConfirmationDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  reason!: string;
}
export class AdminDocumentEditDto extends AdminConfirmationDto {
  @ApiProperty() @IsInt() @Min(0) expected_revision!: number;
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  document_number?: string | null;
  @ApiPropertyOptional({ nullable: true, type: String, format: 'date' })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsDateString({ strict: true })
  expiry_date?: string | null;
}
export class AdminVehicleEditDto extends CreateDriverVehicleDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  expected_updated_at!: string;
  @ApiProperty() @IsBoolean() is_active!: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
