import { IsInt, Min, Matches, IsDateString } from 'class-validator';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const DRIVER_DOCUMENT_TYPES = [
  'AADHAAR',
  'DRIVING_LICENCE',
  'POLICE_VERIFICATION',
  'PAN',
  'OTHER',
] as const;

export class CreateDriverDocumentDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expiry_date?: string;

  @ApiPropertyOptional({
    description: 'Required when updating an existing document',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  expected_revision?: number;

  @ApiProperty({ enum: DRIVER_DOCUMENT_TYPES })
  @IsEnum(DRIVER_DOCUMENT_TYPES)
  document_type!: (typeof DRIVER_DOCUMENT_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  document_number?: string;
}
