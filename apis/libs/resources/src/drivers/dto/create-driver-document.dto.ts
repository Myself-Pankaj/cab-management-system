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
  @ApiProperty({ enum: DRIVER_DOCUMENT_TYPES })
  @IsEnum(DRIVER_DOCUMENT_TYPES)
  document_type!: (typeof DRIVER_DOCUMENT_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  document_number?: string;
}
