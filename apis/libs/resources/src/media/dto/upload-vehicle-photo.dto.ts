import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBase64, IsInt, IsOptional, MaxLength, Min } from 'class-validator';

export class UploadVehiclePhotoDto {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  expected_revision?: number;
  @ApiProperty({
    description: 'Base64 encoded JPEG, PNG, or WebP, maximum 10 MB decoded',
  })
  @IsBase64()
  @MaxLength(13981016)
  content_base64!: string;
}
