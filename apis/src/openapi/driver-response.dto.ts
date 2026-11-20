import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleResponseDto, RideDetailDto } from './response.dto.js';
export class RideIdentityDto {
  @ApiProperty() driver_name!: string;
  @ApiProperty() vehicle_number!: string;
  @ApiProperty() vehicle_category!: string;
}
export class RideOfferDto {
  @ApiProperty({ type: () => RideIdentityDto, nullable: true })
  identity!: RideIdentityDto | null;
  @ApiProperty() id!: string;
  @ApiProperty() ride_id!: string;
  @ApiProperty() driver_profile_id!: string;
  @ApiProperty() vehicle_id!: string;
  @ApiProperty({ nullable: true, type: String }) assigned_by!: string | null;
  @ApiProperty({
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVOKED'],
  })
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
  @ApiProperty({ format: 'date-time' }) expires_at!: string;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  responded_at!: string | null;
  @ApiProperty({ nullable: true, type: String }) reason!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  released_at!: string | null;
  @ApiProperty({ nullable: true, type: String }) released_by!: string | null;
  @ApiProperty({ nullable: true, type: String }) release_reason!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  cancelled_at!: string | null;
}
export class DriverOfferListItemDto extends RideOfferDto {
  @ApiProperty() ride_status!: string;
  @ApiProperty({ format: 'date-time' }) pickup_at!: string;
  @ApiProperty() pickup_address!: string;
  @ApiProperty() destination_address!: string;
  @ApiProperty() can_view_ride!: boolean;
}
export class DriverOffersDto {
  @ApiProperty({ type: () => DriverOfferListItemDto, isArray: true })
  offers!: DriverOfferListItemDto[];
  @ApiProperty() total!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() offset!: number;
}
export class OfferResultDto {
  @ApiProperty({ type: () => RideOfferDto }) offer!: RideOfferDto;
}
export class CompletionDeclarationDto {
  @ApiProperty() id!: string;
  @ApiProperty() ride_id!: string;
  @ApiProperty() driver_profile_id!: string;
  @ApiProperty() declared_by!: string;
  @ApiProperty() declared_cash!: number;
  @ApiProperty({ nullable: true, type: String }) payment_id!: string | null;
  @ApiProperty({ nullable: true, type: String }) note!: string | null;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}
export class DriverRideDetailDto extends RideDetailDto {
  @ApiProperty({ type: () => VehicleResponseDto, nullable: true })
  vehicle!: VehicleResponseDto | null;
  @ApiProperty({ type: () => RideOfferDto, isArray: true })
  offers!: RideOfferDto[];
  @ApiProperty({ type: String, isArray: true }) permitted_actions!: string[];
  @ApiPropertyOptional({ type: () => CompletionDeclarationDto })
  completion?: CompletionDeclarationDto;
}
export class EligibleDriverDto {
  @ApiProperty() driver_profile_id!: string;
  @ApiProperty() vehicle_id!: string;
  @ApiProperty() vehicle_number!: string;
  @ApiProperty() vehicle_type!: string;
  @ApiProperty() full_name!: string;
}
export class EligibleDriversDto {
  @ApiProperty({ type: () => EligibleDriverDto, isArray: true })
  drivers!: EligibleDriverDto[];
}
