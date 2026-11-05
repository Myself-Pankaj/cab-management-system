import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChooseRoleDto {
  @ApiProperty({ enum: ['Passenger', 'Driver'] })
  @IsEnum(['Passenger', 'Driver'], {
    message: 'role must be Passenger or Driver',
  })
  role!: 'Passenger' | 'Driver';
}
