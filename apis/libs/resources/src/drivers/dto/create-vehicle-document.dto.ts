import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VEHICLE_DOCUMENT_TYPES = ['RC', 'PUC', 'INSURANCE', 'PERMIT', 'OTHER'] as const;

export class CreateVehicleDocumentDto {
  @ApiProperty({ enum: VEHICLE_DOCUMENT_TYPES })
  @IsEnum(VEHICLE_DOCUMENT_TYPES)
  document_type!: (typeof VEHICLE_DOCUMENT_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  document_number?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsString()
  expiry_date?: string;
}
