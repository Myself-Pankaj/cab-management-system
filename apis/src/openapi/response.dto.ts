import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Wire models describe the JSON produced by the existing services and interceptor.

export class UserResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string', nullable: true })
  first_name!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  last_name!: string | null;
  @ApiProperty({ type: 'string' })
  full_name!: string;
  @ApiProperty({ type: 'string', nullable: true })
  email!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  phone_number!: string | null;
  @ApiProperty({ type: 'string', enum: ['apple', 'email', 'google', 'phone'] })
  auth_provider!: 'apple' | 'email' | 'google' | 'phone';
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: ['Admin', 'Driver', 'Passenger'],
  })
  global_role!: 'Admin' | 'Driver' | 'Passenger' | null;
  @ApiProperty({ type: 'boolean' })
  email_verified!: boolean;
  @ApiProperty({ type: 'boolean' })
  phone_verified!: boolean;
  @ApiProperty({ type: 'boolean' })
  is_active!: boolean;
  @ApiProperty({ type: 'boolean' })
  is_blocked!: boolean;
  @ApiProperty({ type: 'string', nullable: true })
  avatar_url!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date' })
  date_of_birth!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  gender!: string | null;
  @ApiProperty({ type: 'string' })
  timezone!: string;
  @ApiProperty({ type: 'string' })
  language!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  last_login_at!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class MessageResponseDto {
  @ApiProperty({ type: 'string' })
  message!: string;
}

export class OtpMessageResponseDto {
  @ApiProperty({ type: 'string' })
  message!: string;
  @ApiPropertyOptional({ type: 'string' })
  dev_otp?: string;
}

export class UserDataDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
}

export class RegistrationResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
  @ApiProperty({ type: 'string' })
  message!: string;
  @ApiPropertyOptional({ type: 'string' })
  dev_otp?: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
  @ApiProperty({ type: 'string' })
  access_token!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  access_token_expires_at!: string;
  @ApiPropertyOptional({ type: 'string' })
  refresh_token?: string;
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  refresh_token_expires_at?: string;
}

export class RefreshSessionResponseDto {
  @ApiProperty({ type: 'string' })
  message!: string;
  @ApiProperty({ type: 'string' })
  access_token!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  access_token_expires_at!: string;
}

export class ImageResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({
    type: 'string',
    enum: ['USER', 'DRIVER_DOCUMENT', 'VEHICLE', 'VEHICLE_DOCUMENT'],
  })
  owner_type!: 'USER' | 'DRIVER_DOCUMENT' | 'VEHICLE' | 'VEHICLE_DOCUMENT';
  @ApiProperty({ type: 'string' })
  owner_id!: string;
  @ApiProperty({ type: 'string' })
  image_type!: string;
  @ApiProperty({ type: 'string' })
  imagekit_file_id!: string;
  @ApiProperty({ type: 'string' })
  url!: string;
  @ApiProperty({ type: 'string', nullable: true })
  file_name!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  mime_type!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class ImageDataDto {
  @ApiProperty({ type: () => ImageResponseDto })
  image!: ImageResponseDto;
}

export class ImagesDataDto {
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
}

export class UploadAuthResponseDto {
  @ApiProperty({ type: 'string' })
  public_key!: string;
  @ApiProperty({ type: 'string' })
  token!: string;
  @ApiProperty({ type: 'number' })
  expire!: number;
  @ApiProperty({ type: 'string' })
  signature!: string;
}

export class DriverProfileResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  user_id!: string;
  @ApiProperty({
    type: 'string',
    enum: [
      'DRAFT',
      'PENDING_VERIFICATION',
      'APPROVED',
      'REJECTED',
      'SUSPENDED',
    ],
  })
  status!:
    'DRAFT' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class DriverProfileDataDto {
  @ApiProperty({ type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto;
}

export class DocumentResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({
    type: 'string',
    enum: ['AADHAAR', 'DRIVING_LICENCE', 'OTHER', 'PAN', 'POLICE_VERIFICATION'],
  })
  document_type!:
    'AADHAAR' | 'DRIVING_LICENCE' | 'OTHER' | 'PAN' | 'POLICE_VERIFICATION';
  @ApiProperty({ type: 'string', nullable: true })
  document_number!: string | null;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  uploaded_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
}

export class DocumentWithImagesDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({
    type: 'string',
    enum: ['AADHAAR', 'DRIVING_LICENCE', 'OTHER', 'PAN', 'POLICE_VERIFICATION'],
  })
  document_type!:
    'AADHAAR' | 'DRIVING_LICENCE' | 'OTHER' | 'PAN' | 'POLICE_VERIFICATION';
  @ApiProperty({ type: 'string', nullable: true })
  document_number!: string | null;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  uploaded_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
}

export class DocumentCreatedDto {
  @ApiProperty({ type: () => DocumentResponseDto })
  document!: DocumentResponseDto;
  @ApiProperty({ type: 'string' })
  message!: string;
}

export class DocumentsDataDto {
  @ApiProperty({ type: () => DocumentWithImagesDto, isArray: true })
  documents!: DocumentWithImagesDto[];
}

export class BankAccountResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({ type: 'string' })
  account_holder_name!: string;
  @ApiProperty({ type: 'string' })
  account_number!: string;
  @ApiProperty({ type: 'string' })
  ifsc!: string;
  @ApiProperty({ type: 'string' })
  bank_name!: string;
  @ApiProperty({ type: 'string', nullable: true })
  razorpay_fund_account_id!: string | null;
  @ApiProperty({ type: 'boolean' })
  is_verified!: boolean;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class BankAccountDataDto {
  @ApiProperty({ nullable: true, type: () => BankAccountResponseDto })
  bank_account!: BankAccountResponseDto | null;
}

export class BankAccountSavedDto {
  @ApiProperty({ type: () => BankAccountResponseDto })
  bank_account!: BankAccountResponseDto;
}

export class VehicleResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({ type: 'string' })
  vehicle_number!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  vehicle_type!: 'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12' | null;
  @ApiProperty({ type: 'string', nullable: true })
  make!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  model!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  color!: string | null;
  @ApiProperty({ type: 'number', nullable: true })
  manufacturing_year!: number | null;
  @ApiProperty({ type: 'boolean' })
  is_active!: boolean;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class VehicleWithImagesDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({ type: 'string' })
  vehicle_number!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  vehicle_type!: 'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12' | null;
  @ApiProperty({ type: 'string', nullable: true })
  make!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  model!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  color!: string | null;
  @ApiProperty({ type: 'number', nullable: true })
  manufacturing_year!: number | null;
  @ApiProperty({ type: 'boolean' })
  is_active!: boolean;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
}

export class VehicleDataDto {
  @ApiProperty({ type: () => VehicleResponseDto })
  vehicle!: VehicleResponseDto;
}

export class VehiclesDataDto {
  @ApiProperty({ type: () => VehicleWithImagesDto, isArray: true })
  vehicles!: VehicleWithImagesDto[];
}

export class VehicleDocumentResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  vehicle_id!: string;
  @ApiProperty({ type: 'string' })
  document_type!: string;
  @ApiProperty({ type: 'string', nullable: true })
  document_number!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date' })
  expiry_date!: string | null;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  uploaded_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
}

export class VehicleDocumentCreatedDto {
  @ApiProperty({ type: () => VehicleDocumentResponseDto })
  document!: VehicleDocumentResponseDto;
  @ApiProperty({ type: 'string' })
  message!: string;
}

export class VerificationSubmittedDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', format: 'date-time' })
  submitted_at!: string;
}

export class DriverSubmittedDto {
  @ApiProperty({ type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto;
  @ApiProperty({ type: () => VerificationSubmittedDto })
  verification!: VerificationSubmittedDto;
}

export class PendingDriverDto {
  @ApiProperty({ type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto;
  @ApiProperty({ nullable: true, type: () => UserResponseDto })
  user!: UserResponseDto | null;
}

export class PendingDriversDto {
  @ApiProperty({ type: () => PendingDriverDto, isArray: true })
  drivers!: PendingDriverDto[];
}

export class AdminDocumentDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({
    type: 'string',
    enum: ['AADHAAR', 'DRIVING_LICENCE', 'OTHER', 'PAN', 'POLICE_VERIFICATION'],
  })
  document_type!:
    'AADHAAR' | 'DRIVING_LICENCE' | 'OTHER' | 'PAN' | 'POLICE_VERIFICATION';
  @ApiProperty({ type: 'string', nullable: true })
  document_number!: string | null;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  uploaded_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
}

export class AdminVehicleDocumentDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  document_type!: string;
  @ApiProperty({ type: 'string', nullable: true })
  document_number!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date' })
  expiry_date!: string | null;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  uploaded_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
}

export class AdminVehicleDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  driver_profile_id!: string;
  @ApiProperty({ type: 'string' })
  vehicle_number!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  vehicle_type!: 'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12' | null;
  @ApiProperty({ type: 'string', nullable: true })
  make!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  model!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  color!: string | null;
  @ApiProperty({ type: 'number', nullable: true })
  manufacturing_year!: number | null;
  @ApiProperty({ type: 'boolean' })
  is_active!: boolean;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
  @ApiProperty({ type: () => ImageResponseDto, isArray: true })
  images!: ImageResponseDto[];
  @ApiProperty({ type: () => AdminVehicleDocumentDto, isArray: true })
  documents!: AdminVehicleDocumentDto[];
}

export class AdminBankAccountDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  account_holder_name!: string;
  @ApiProperty({ type: 'string' })
  account_number!: string;
  @ApiProperty({ type: 'string' })
  ifsc!: string;
  @ApiProperty({ type: 'string' })
  bank_name!: string;
  @ApiProperty({ type: 'string', nullable: true })
  razorpay_fund_account_id!: string | null;
  @ApiProperty({ type: 'boolean' })
  is_verified!: boolean;
}

export class AdminDriverDetailDto {
  @ApiProperty({ type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto;
  @ApiProperty({ nullable: true, type: () => UserResponseDto })
  user!: UserResponseDto | null;
  @ApiProperty({ type: () => AdminDocumentDto, isArray: true })
  documents!: AdminDocumentDto[];
  @ApiProperty({ nullable: true, type: () => AdminBankAccountDto })
  bank_account!: AdminBankAccountDto | null;
  @ApiProperty({ type: () => AdminVehicleDto, isArray: true })
  vehicles!: AdminVehicleDto[];
}

export class ReviewResultDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty({ type: 'string', nullable: true })
  rejection_reason!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  reviewed_at!: string | null;
}

export class DriverReviewedDto {
  @ApiProperty({ nullable: true, type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto | null;
  @ApiProperty({ nullable: true, type: () => ReviewResultDto })
  verification!: ReviewResultDto | null;
}

export class DocumentReviewedDto {
  @ApiProperty({ nullable: true, type: () => ReviewResultDto })
  document!: ReviewResultDto | null;
}

export class VehicleCategoryResponseDto {
  @ApiProperty({
    type: 'string',
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  category!: 'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12';
  @ApiProperty({ type: 'string' })
  display_name!: string;
  @ApiProperty({ type: 'number' })
  base_fare_inr!: number;
  @ApiProperty({ type: 'number' })
  per_km_rate_inr!: number;
  @ApiProperty({ type: 'number' })
  min_fare_inr!: number;
  @ApiProperty({ type: 'number' })
  seat_limit!: number;
}

export class FareBreakdownDto {
  @ApiProperty({ type: 'number' })
  base_fare_inr!: number;
  @ApiProperty({ type: 'number' })
  per_km_rate_inr!: number;
  @ApiProperty({ type: 'number' })
  distance_km!: number;
  @ApiProperty({ type: 'number' })
  distance_charge_inr!: number;
  @ApiProperty({ type: 'number' })
  estimated_fare_inr!: number;
}

export class LocationSuggestionDto {
  @ApiProperty({ type: 'string' }) id!: string;
  @ApiProperty({ type: 'string' }) label!: string;
  @ApiProperty({ type: 'number' }) latitude!: number;
  @ApiProperty({ type: 'number' }) longitude!: number;
}
export class RideQuoteResponseDto {
  @ApiProperty({
    type: 'string',
    required: false,
    description:
      'ORS encoded polyline, precision 5. Outbound route for round trips.',
  })
  route_geometry?: string;

  @ApiProperty({
    type: 'string',
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  vehicle_category!: 'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12';
  @ApiProperty({ type: 'number' })
  seat_limit!: number;
  @ApiProperty({ type: 'number' })
  passenger_count!: number;
  @ApiProperty({ type: 'string', enum: ['ONE_WAY', 'ROUND_TRIP'] })
  trip_type!: 'ONE_WAY' | 'ROUND_TRIP';
  @ApiProperty({ type: 'number' })
  distance_km!: number;
  @ApiProperty({ type: 'number' })
  estimated_duration_minutes!: number;
  @ApiProperty({ type: () => FareBreakdownDto })
  fare_breakdown!: FareBreakdownDto;
}

export class RideResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  booked_by_user_id!: string;
  @ApiProperty({ type: 'string', nullable: true })
  driver_profile_id!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  vehicle_id!: string | null;
  @ApiProperty({
    type: 'string',
    enum: ['SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12'],
  })
  requested_vehicle_category!:
    'SEATER_4' | 'SEATER_5' | 'SEATER_7' | 'SEATER_12';
  @ApiProperty({ type: 'number' })
  passenger_count!: number;
  @ApiProperty({ type: 'string', enum: ['ONE_WAY', 'ROUND_TRIP'] })
  trip_type!: 'ONE_WAY' | 'ROUND_TRIP';
  @ApiProperty({ type: 'string' })
  pickup_address!: string;
  @ApiProperty({ type: 'string', nullable: true })
  pickup_exact_location!: string | null;
  @ApiProperty({ type: 'number' })
  pickup_latitude!: number;
  @ApiProperty({ type: 'number' })
  pickup_longitude!: number;
  @ApiProperty({ type: 'string' })
  destination_address!: string;
  @ApiProperty({ type: 'string', nullable: true })
  exact_destination!: string | null;
  @ApiProperty({ type: 'number' })
  destination_latitude!: number;
  @ApiProperty({ type: 'number' })
  destination_longitude!: number;
  @ApiProperty({ type: 'number' })
  distance_km!: number;
  @ApiProperty({ type: 'number' })
  estimated_duration_minutes!: number;
  @ApiProperty({ type: 'string', format: 'date-time' })
  pickup_at!: string;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  return_at!: string | null;
  @ApiProperty({ type: 'number' })
  estimated_fare!: number;
  @ApiProperty({ type: 'number', nullable: true })
  final_fare!: number | null;
  @ApiProperty({ type: 'string', enum: ['OFFLINE', 'ONLINE', 'PARTIAL'] })
  payment_option!: 'OFFLINE' | 'ONLINE' | 'PARTIAL';
  @ApiProperty({
    type: 'string',
    enum: [
      'PENDING_PAYMENT',
      'PAYMENT_FAILED',
      'PENDING_ASSIGNMENT',
      'DRIVER_ASSIGNED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  status!:
    | 'PENDING_PAYMENT'
    | 'PAYMENT_FAILED'
    | 'PENDING_ASSIGNMENT'
    | 'DRIVER_ASSIGNED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  @ApiProperty({ type: 'string', nullable: true })
  assigned_by!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  assigned_at!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  cancelled_by!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  cancellation_reason!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  cancelled_at!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class RidesDataDto {
  @ApiProperty({ type: () => RideResponseDto, isArray: true })
  rides!: RideResponseDto[];
}

export class RidePassengerResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  name!: string;
  @ApiProperty({ type: 'string' })
  phone!: string;
  @ApiProperty({ type: 'boolean' })
  is_primary!: boolean;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
}

export class PaymentResponseDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ type: 'string' })
  ride_id!: string;
  @ApiProperty({ type: 'string', enum: ['OFFLINE', 'ONLINE'] })
  payment_type!: 'OFFLINE' | 'ONLINE';
  @ApiProperty({ type: 'number' })
  amount!: number;
  @ApiProperty({ type: 'string' })
  currency!: string;
  @ApiProperty({ type: 'string', nullable: true })
  provider!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  provider_order_id!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  provider_payment_id!: string | null;
  @ApiProperty({
    type: 'string',
    enum: [
      'CANCELLED',
      'CREATED',
      'FAILED',
      'PAID',
      'PARTIALLY_REFUNDED',
      'PENDING',
      'REFUNDED',
    ],
  })
  status!:
    | 'CANCELLED'
    | 'CREATED'
    | 'FAILED'
    | 'PAID'
    | 'PARTIALLY_REFUNDED'
    | 'PENDING'
    | 'REFUNDED';
  @ApiProperty({ type: 'string', nullable: true })
  payment_method!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  paid_at!: string | null;
  @ApiProperty({ type: 'string', nullable: true, format: 'date-time' })
  failed_at!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: string;
}

export class PaymentSummaryDto {
  @ApiProperty({ type: 'number' })
  estimated_fare!: number;
  @ApiProperty({ type: 'number' })
  paid_amount!: number;
  @ApiProperty({ type: 'number' })
  remaining_amount!: number;
  @ApiProperty({ type: 'string', enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'] })
  summary_status!: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
}

export class StatusHistoryDto {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
    enum: [
      'PENDING_PAYMENT',
      'PAYMENT_FAILED',
      'PENDING_ASSIGNMENT',
      'DRIVER_ASSIGNED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  old_status!:
    | 'PENDING_PAYMENT'
    | 'PAYMENT_FAILED'
    | 'PENDING_ASSIGNMENT'
    | 'DRIVER_ASSIGNED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | null;
  @ApiProperty({
    type: 'string',
    enum: [
      'PENDING_PAYMENT',
      'PAYMENT_FAILED',
      'PENDING_ASSIGNMENT',
      'DRIVER_ASSIGNED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  new_status!:
    | 'PENDING_PAYMENT'
    | 'PAYMENT_FAILED'
    | 'PENDING_ASSIGNMENT'
    | 'DRIVER_ASSIGNED'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  @ApiProperty({ type: 'string', nullable: true })
  changed_by!: string | null;
  @ApiProperty({ type: 'string', nullable: true })
  note!: string | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: string;
}

export class RideDetailDto {
  @ApiProperty({ type: () => RideResponseDto })
  ride!: RideResponseDto;
  @ApiProperty({ type: () => RidePassengerResponseDto, isArray: true })
  passengers!: RidePassengerResponseDto[];
  @ApiProperty({ type: () => PaymentResponseDto, isArray: true })
  payments!: PaymentResponseDto[];
  @ApiProperty({ type: () => PaymentSummaryDto })
  payment_summary!: PaymentSummaryDto;
  @ApiProperty({ type: () => StatusHistoryDto, isArray: true })
  status_history!: StatusHistoryDto[];
}

export class RazorpayOrderDto {
  @ApiProperty({ type: 'string' })
  key_id!: string;
  @ApiProperty({ type: 'string' })
  order_id!: string;
  @ApiProperty({ oneOf: [{ type: 'number' }, { type: 'string' }] })
  amount!: number | string;
  @ApiProperty({ type: 'string' })
  currency!: string;
}

export class OnlinePaymentDto {
  @ApiProperty({ type: 'string' })
  ride_id!: string;
  @ApiProperty({ nullable: true, type: () => PaymentResponseDto })
  payment!: PaymentResponseDto | null;
  @ApiProperty({ type: () => RazorpayOrderDto })
  razorpay!: RazorpayOrderDto;
}

export class PaymentDataDto {
  @ApiProperty({ nullable: true, type: () => PaymentResponseDto })
  payment!: PaymentResponseDto | null;
}

export class LivenessDto {
  @ApiProperty({ type: 'string', enum: ['ok'] })
  status!: 'ok';
}

export class DatabaseHealthDto {
  @ApiProperty({ type: 'boolean' })
  ok!: boolean;
  @ApiPropertyOptional({ type: 'number' })
  latencyMs?: number;
  @ApiPropertyOptional({ type: 'string' })
  error?: string;
}

export class PoolStatsDto {
  @ApiProperty({ type: 'number' })
  totalCount!: number;
  @ApiProperty({ type: 'number' })
  idleCount!: number;
  @ApiProperty({ type: 'number' })
  waitingCount!: number;
  @ApiProperty({ type: 'number' })
  max!: number;
}

export class ReadinessDto {
  @ApiProperty({ type: 'string', enum: ['ready', 'not_ready'] })
  status!: 'ready' | 'not_ready';
  @ApiProperty({ type: () => DatabaseHealthDto })
  db!: DatabaseHealthDto;
  @ApiProperty({ type: () => PoolStatsDto })
  pool!: PoolStatsDto;
  @ApiProperty({ type: 'number' })
  ping!: number;
  @ApiProperty({ type: 'boolean' })
  saturated!: boolean;
  @ApiProperty({ type: 'boolean' })
  shuttingDown!: boolean;
}

export class OnboardingChecklistDto {
  @ApiProperty({ type: 'boolean' })
  aadhaar!: boolean;
  @ApiProperty({ type: 'boolean' })
  driving_licence!: boolean;
  @ApiProperty({ type: 'boolean' })
  bank_details!: boolean;
  @ApiProperty({ type: 'boolean' })
  vehicle!: boolean;
  @ApiProperty({ type: 'boolean' })
  rc!: boolean;
  @ApiProperty({ type: 'boolean' })
  puc!: boolean;
}

export class OnboardingVerificationDto extends ReviewResultDto {
  @ApiProperty({ type: 'string', format: 'date-time' })
  submitted_at!: string;
}

export class DriverOnboardingDataDto {
  @ApiProperty({ type: () => DriverProfileResponseDto })
  profile!: DriverProfileResponseDto;
  @ApiProperty({ type: () => OnboardingVerificationDto, nullable: true })
  verification!: OnboardingVerificationDto | null;
  @ApiProperty({ type: () => DocumentWithImagesDto, isArray: true })
  documents!: DocumentWithImagesDto[];
  @ApiProperty({ type: () => BankAccountResponseDto, nullable: true })
  bank_account!: BankAccountResponseDto | null;
  @ApiProperty({ type: () => AdminVehicleDto, isArray: true })
  vehicles!: AdminVehicleDto[];
  @ApiProperty({ type: () => OnboardingChecklistDto })
  checklist!: OnboardingChecklistDto;
  @ApiProperty({ type: 'boolean' })
  complete!: boolean;
}
