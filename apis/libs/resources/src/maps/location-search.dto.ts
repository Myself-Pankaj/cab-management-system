import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class LocationSearchDto {
  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @Length(3, 200)
  text!: string;
}
