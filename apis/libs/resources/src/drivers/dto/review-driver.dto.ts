import { IsUUID } from 'class-validator';
import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewDriverDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejection_reason?: string;
}

export class ReviewDocumentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() operation_id!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  expected_revision!: number;

  @ApiPropertyOptional({ enum: ['IMAGE', 'METADATA', 'BOTH'] })
  @IsOptional()
  @IsEnum(['IMAGE', 'METADATA', 'BOTH'])
  correction_mode?: 'IMAGE' | 'METADATA' | 'BOTH';

  @ApiPropertyOptional({
    enum: ['document_number', 'expiry_date'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(['document_number', 'expiry_date'], { each: true })
  metadata_fields?: ('document_number' | 'expiry_date')[];

  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejection_reason?: string;
}

export class ReviewVehicleDto extends ReviewDriverDto {
  @ApiProperty({ enum: ['DETAILS', 'PHOTOS'] })
  @IsEnum(['DETAILS', 'PHOTOS'])
  group!: 'DETAILS' | 'PHOTOS';

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  expected_revision!: number;
}
