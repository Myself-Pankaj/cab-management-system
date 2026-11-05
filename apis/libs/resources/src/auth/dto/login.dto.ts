import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @ValidateIf((dto: LoginDto) => !dto.phone_number)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @ValidateIf((dto: LoginDto) => !dto.email)
  @IsString()
  @IsNotEmpty()
  phone_number?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
