import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBase64,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
export class UploadDocumentDto {
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  expected_revision!: number;

  @ApiProperty({ enum: ['DRIVER_DOCUMENT', 'VEHICLE_DOCUMENT'] })
  @IsEnum(['DRIVER_DOCUMENT', 'VEHICLE_DOCUMENT'])
  owner_type!: 'DRIVER_DOCUMENT' | 'VEHICLE_DOCUMENT';
  @ApiProperty({ format: 'uuid' }) @IsUUID() owner_id!: string;
  @ApiProperty({
    description: 'Base64 encoded JPEG, PNG, or WebP, maximum 10 MB decoded',
  })
  @IsBase64()
  @MaxLength(13981016)
  content_base64!: string;
  @ApiProperty({
    description: 'Must be MASKED for Aadhaar uploads',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Equals('MASKED')
  aadhaar_copy?: 'MASKED';
}
