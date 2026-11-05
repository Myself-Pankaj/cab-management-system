import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const IMAGE_OWNER_TYPES = [
  'USER',
  'DRIVER_DOCUMENT',
  'VEHICLE',
  'VEHICLE_DOCUMENT',
] as const;

export class RegisterImageDto {
  @ApiProperty({ enum: IMAGE_OWNER_TYPES })
  @IsEnum(IMAGE_OWNER_TYPES)
  owner_type!: (typeof IMAGE_OWNER_TYPES)[number];

  @ApiProperty({ format: 'uuid' })
  @IsString()
  owner_id!: string;

  @ApiProperty({ example: 'AVATAR' })
  @IsString()
  @MaxLength(30)
  image_type!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  imagekit_file_id!: string;

  @ApiProperty()
  @IsUrl()
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  file_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mime_type?: string;
}
