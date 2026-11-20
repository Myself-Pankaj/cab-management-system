import { ApiProperty } from '@nestjs/swagger';
import {
  AdminVehicleDto,
  VehicleResponseDto,
  PaymentSummaryDto,
  RideResponseDto,
} from './response.dto.js';

export class AdminPaginationDto {
  @ApiProperty() total!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() offset!: number;
}
export class AdminRolePercentagesDto {
  @ApiProperty() drivers!: number;
  @ApiProperty() passengers!: number;
  @ApiProperty() admins!: number;
  @ApiProperty() unselected!: number;
}
export class AdminUserCountsDto {
  @ApiProperty() total!: number;
  @ApiProperty() drivers!: number;
  @ApiProperty() passengers!: number;
  @ApiProperty() admins!: number;
  @ApiProperty() unselected!: number;
  @ApiProperty({ type: () => AdminRolePercentagesDto })
  percentages!: AdminRolePercentagesDto;
}
export class AdminVehicleCountsDto {
  @ApiProperty() total!: number;
  @ApiProperty() active!: number;
}
export class AdminRideCountsDto {
  @ApiProperty() total!: number;
  @ApiProperty() today!: number;
  @ApiProperty() active!: number;
  @ApiProperty() completed!: number;
  @ApiProperty() awaiting_assignment!: number;
  @ApiProperty() awaiting_acceptance!: number;
  @ApiProperty() confirmed!: number;
  @ApiProperty() ongoing!: number;
  @ApiProperty() cancelled!: number;
  @ApiProperty() pending_payment!: number;
  @ApiProperty() payment_failed!: number;
}
export class AdminVerificationCountsDto {
  @ApiProperty() pending_drivers!: number;
  @ApiProperty() pending_documents!: number;
}
export class AdminUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() full_name!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty({ type: String, nullable: true }) phone_number!: string | null;
  @ApiProperty({ type: String, nullable: true }) global_role!: string | null;
  @ApiProperty() is_active!: boolean;
  @ApiProperty() is_blocked!: boolean;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  last_login_at!: string | null;
}
export class AdminApplicationDto {
  @ApiProperty() id!: string;
  @ApiProperty() user_id!: string;
  @ApiProperty() profile_status!: string;
  @ApiProperty() full_name!: string;
  @ApiProperty() application_status!: string;
  @ApiProperty() review_state!: string;
  @ApiProperty({ type: String, nullable: true }) email!: string | null;
  @ApiProperty() has_corrections!: boolean;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  submitted_at!: string | null;
}
export class AdminVehicleDocumentSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() vehicle_id!: string;
  @ApiProperty() document_type!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: String, nullable: true, format: 'date' }) expiry_date!:
    string | null;
}
export class AdminFleetVehicleDto {
  @ApiProperty() id!: string;
  @ApiProperty() driver_profile_id!: string;
  @ApiProperty() vehicle_number!: string;
  @ApiProperty() driver_name!: string;
  @ApiProperty({ type: String, nullable: true }) vehicle_type!: string | null;
  @ApiProperty({ type: String, nullable: true }) make!: string | null;
  @ApiProperty({ type: String, nullable: true }) model!: string | null;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: String, nullable: true }) color!: string | null;
  @ApiProperty({ type: Number, nullable: true }) manufacturing_year!:
    number | null;
  @ApiProperty({ format: 'date-time' }) updated_at!: string;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ type: () => AdminVehicleDocumentSummaryDto, isArray: true })
  documents!: AdminVehicleDocumentSummaryDto[];
}
export class AdminPaymentDto {
  @ApiProperty() id!: string;
  @ApiProperty() ride_id!: string;
  @ApiProperty() user_id!: string;
  @ApiProperty() user_name!: string;
  @ApiProperty() payment_type!: string;
  @ApiProperty() currency!: string;
  @ApiProperty() status!: string;
  @ApiProperty() amount!: number;
  @ApiProperty({ type: String, nullable: true }) provider!: string | null;
  @ApiProperty({ type: String, nullable: true }) payment_method!: string | null;
  @ApiProperty({ type: String, nullable: true }) paid_at!: string | null;
  @ApiProperty({ type: String, nullable: true }) failed_at!: string | null;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}
export class AdminPaymentSummaryDto {
  @ApiProperty() total!: number;
  @ApiProperty() online_collected!: number;
  @ApiProperty() cash_collected!: number;
  @ApiProperty() successful!: number;
  @ApiProperty() failed!: number;
  @ApiProperty() refunded!: number;
  @ApiProperty() partially_refunded!: number;
}
export class AdminUsersPageDto extends AdminPaginationDto {
  @ApiProperty({ type: () => AdminUserDto, isArray: true })
  items!: AdminUserDto[];
}
export class AdminApplicationsPageDto extends AdminPaginationDto {
  @ApiProperty({ type: () => AdminApplicationDto, isArray: true })
  items!: AdminApplicationDto[];
}
export class AdminVehiclesPageDto extends AdminPaginationDto {
  @ApiProperty({ type: () => AdminFleetVehicleDto, isArray: true })
  items!: AdminFleetVehicleDto[];
}
export class AdminPaymentsPageDto extends AdminPaginationDto {
  @ApiProperty({ type: () => AdminPaymentDto, isArray: true })
  items!: AdminPaymentDto[];
  @ApiProperty({ type: () => AdminPaymentSummaryDto })
  summary!: AdminPaymentSummaryDto;
}
export class AdminRidesPageDto extends AdminPaginationDto {
  @ApiProperty({ type: () => RideResponseDto, isArray: true })
  items!: RideResponseDto[];
  @ApiProperty({ type: () => RideResponseDto, isArray: true })
  rides!: RideResponseDto[];
}
export class AdminDashboardSummaryDto {
  @ApiProperty({ type: () => AdminUserCountsDto }) users!: AdminUserCountsDto;
  @ApiProperty({ type: () => AdminVehicleCountsDto })
  vehicles!: AdminVehicleCountsDto;
  @ApiProperty({ type: () => AdminRideCountsDto }) rides!: AdminRideCountsDto;
  @ApiProperty({ type: () => AdminVerificationCountsDto })
  verifications!: AdminVerificationCountsDto;
  @ApiProperty({ format: 'date-time' }) calculated_at!: string;
  @ApiProperty({ type: () => AdminApplicationDto, isArray: true })
  pending_reviews!: AdminApplicationDto[];
  @ApiProperty({ type: () => AdminApplicationDto, isArray: true })
  recent_verifications!: AdminApplicationDto[];
  @ApiProperty({ type: () => RideResponseDto, isArray: true })
  recent_bookings!: RideResponseDto[];
  @ApiProperty({ type: () => RideResponseDto, isArray: true })
  awaiting_rides!: RideResponseDto[];
}

export class AdminVehicleBlockingDto {
  @ApiProperty() ride_id!: string;
  @ApiProperty({ type: String, nullable: true }) offer_id!: string | null;
}
export class AdminVehicleAuditValuesDto {
  @ApiProperty() vehicleNumber!: string;
  @ApiProperty({ type: String, nullable: true }) vehicleType!: string | null;
  @ApiProperty({ type: String, nullable: true }) make!: string | null;
  @ApiProperty({ type: String, nullable: true }) model!: string | null;
  @ApiProperty({ type: String, nullable: true }) color!: string | null;
  @ApiProperty({ type: Number, nullable: true }) manufacturingYear!:
    number | null;
  @ApiProperty() active!: boolean;
}
export class AdminVehicleAuditDto {
  @ApiProperty() id!: string;
  @ApiProperty() actor_id!: string;
  @ApiProperty({ type: String, nullable: true }) reason!: string | null;
  @ApiProperty({ type: () => AdminVehicleAuditValuesDto })
  before_values!: AdminVehicleAuditValuesDto;
  @ApiProperty({ type: () => AdminVehicleAuditValuesDto })
  after_values!: AdminVehicleAuditValuesDto;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}
export class AdminVehicleDetailDto {
  @ApiProperty({ type: () => AdminVehicleDto }) vehicle!: AdminVehicleDto;
  @ApiProperty({ type: () => AdminUserDto, nullable: true })
  driver!: AdminUserDto | null;
  @ApiProperty({ type: () => AdminVehicleBlockingDto, isArray: true })
  blocking!: AdminVehicleBlockingDto[];
  @ApiProperty({ type: () => AdminVehicleAuditDto, isArray: true })
  audit!: AdminVehicleAuditDto[];
}
export class AdminVehicleSavedDto {
  @ApiProperty({ type: () => VehicleResponseDto }) vehicle!: VehicleResponseDto;
}
export class AdminPaymentTransactionDto extends AdminPaymentDto {
  @ApiProperty({ type: String, nullable: true }) provider_order_id!:
    string | null;
  @ApiProperty({ type: String, nullable: true }) provider_payment_id!:
    string | null;
}
export class AdminPaymentDetailDto {
  @ApiProperty({ type: () => AdminPaymentTransactionDto })
  payment!: AdminPaymentTransactionDto;
  @ApiProperty({ type: () => PaymentSummaryDto })
  payment_summary!: PaymentSummaryDto;
}
