import { IsInt, Min, Matches, IsDateString } from 'class-validator';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VEHICLE_DOCUMENT_TYPES = [
  'RC',
  'PUC',
  'INSURANCE',
  'PERMIT',
  'OTHER',
] as const;

export class CreateVehicleDocumentDto {
  @ApiPropertyOptional({
    description: 'Required when updating an existing document',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  expected_revision?: number;

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
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expiry_date?: string;
}
