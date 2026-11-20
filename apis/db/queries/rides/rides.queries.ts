/** Types generated for queries found in "db/queries/rides/rides.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type payment_option = 'OFFLINE' | 'ONLINE' | 'PARTIAL';

export type ride_status = 'CANCELLED' | 'COMPLETED' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'IN_PROGRESS' | 'PAYMENT_FAILED' | 'PENDING_ASSIGNMENT' | 'PENDING_PAYMENT';

export type trip_type = 'ONE_WAY' | 'ROUND_TRIP';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'CreateRide' parameters type */
export interface ICreateRideParams {
  bagCount: number;
  bookedByUserId: string;
  bookingKey?: string | null | void;
  bookingPayloadHash?: string | null | void;
  destinationAddress: string;
  destinationLatitude: NumberOrString;
  destinationLongitude: NumberOrString;
  distanceKm: NumberOrString;
  estimatedDurationMinutes: number;
  estimatedFare: NumberOrString;
  exactDestination?: string | null | void;
  passengerCount: number;
  paymentOption: payment_option;
  pickupAddress: string;
  pickupAt: DateOrString;
  pickupExactLocation?: string | null | void;
  pickupLatitude: NumberOrString;
  pickupLongitude: NumberOrString;
  requestedVehicleCategory: vehicle_category;
  returnAt?: DateOrString | null | void;
  specialRequests?: string | null | void;
  status: ride_status;
  tripType: trip_type;
}

/** 'CreateRide' return type */
export interface ICreateRideResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'CreateRide' query type */
export interface ICreateRideQuery {
  params: ICreateRideParams;
  result: ICreateRideResult;
}

const createRideIR: any = {"usedParamSet":{"bookedByUserId":true,"requestedVehicleCategory":true,"passengerCount":true,"bagCount":true,"specialRequests":true,"bookingKey":true,"bookingPayloadHash":true,"tripType":true,"pickupAddress":true,"pickupExactLocation":true,"pickupLatitude":true,"pickupLongitude":true,"destinationAddress":true,"exactDestination":true,"destinationLatitude":true,"destinationLongitude":true,"distanceKm":true,"estimatedDurationMinutes":true,"pickupAt":true,"returnAt":true,"estimatedFare":true,"paymentOption":true,"status":true},"params":[{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":527,"b":542}]},{"name":"requestedVehicleCategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":555,"b":580}]},{"name":"passengerCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":605,"b":620}]},{"name":"bagCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":627,"b":636}]},{"name":"specialRequests","required":false,"transform":{"type":"scalar"},"locs":[{"a":643,"b":658}]},{"name":"bookingKey","required":false,"transform":{"type":"scalar"},"locs":[{"a":665,"b":675}]},{"name":"bookingPayloadHash","required":false,"transform":{"type":"scalar"},"locs":[{"a":682,"b":700}]},{"name":"tripType","required":true,"transform":{"type":"scalar"},"locs":[{"a":707,"b":716}]},{"name":"pickupAddress","required":true,"transform":{"type":"scalar"},"locs":[{"a":734,"b":748}]},{"name":"pickupExactLocation","required":false,"transform":{"type":"scalar"},"locs":[{"a":755,"b":774}]},{"name":"pickupLatitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":781,"b":796}]},{"name":"pickupLongitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":803,"b":819}]},{"name":"destinationAddress","required":true,"transform":{"type":"scalar"},"locs":[{"a":826,"b":845}]},{"name":"exactDestination","required":false,"transform":{"type":"scalar"},"locs":[{"a":852,"b":868}]},{"name":"destinationLatitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":875,"b":895}]},{"name":"destinationLongitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":902,"b":923}]},{"name":"distanceKm","required":true,"transform":{"type":"scalar"},"locs":[{"a":930,"b":941}]},{"name":"estimatedDurationMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":948,"b":973}]},{"name":"pickupAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":980,"b":989}]},{"name":"returnAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":996,"b":1004}]},{"name":"estimatedFare","required":true,"transform":{"type":"scalar"},"locs":[{"a":1011,"b":1025}]},{"name":"paymentOption","required":true,"transform":{"type":"scalar"},"locs":[{"a":1032,"b":1046}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":1069,"b":1076}]}],"statement":"INSERT INTO rides (\n    booked_by_user_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    payment_option,\n    status\n)\nVALUES (\n    :bookedByUserId!::uuid,\n    :requestedVehicleCategory!::vehicle_category,\n    :passengerCount!,\n    :bagCount!,\n    :specialRequests,\n    :bookingKey,\n    :bookingPayloadHash,\n    :tripType!::trip_type,\n    :pickupAddress!,\n    :pickupExactLocation,\n    :pickupLatitude!,\n    :pickupLongitude!,\n    :destinationAddress!,\n    :exactDestination,\n    :destinationLatitude!,\n    :destinationLongitude!,\n    :distanceKm!,\n    :estimatedDurationMinutes!,\n    :pickupAt!,\n    :returnAt,\n    :estimatedFare!,\n    :paymentOption!::payment_option,\n    :status!::ride_status\n)\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rides (
 *     booked_by_user_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     payment_option,
 *     status
 * )
 * VALUES (
 *     :bookedByUserId!::uuid,
 *     :requestedVehicleCategory!::vehicle_category,
 *     :passengerCount!,
 *     :bagCount!,
 *     :specialRequests,
 *     :bookingKey,
 *     :bookingPayloadHash,
 *     :tripType!::trip_type,
 *     :pickupAddress!,
 *     :pickupExactLocation,
 *     :pickupLatitude!,
 *     :pickupLongitude!,
 *     :destinationAddress!,
 *     :exactDestination,
 *     :destinationLatitude!,
 *     :destinationLongitude!,
 *     :distanceKm!,
 *     :estimatedDurationMinutes!,
 *     :pickupAt!,
 *     :returnAt,
 *     :estimatedFare!,
 *     :paymentOption!::payment_option,
 *     :status!::ride_status
 * )
 * RETURNING
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const createRide = new PreparedQuery<ICreateRideParams,ICreateRideResult>(createRideIR);


/** 'GetRideById' parameters type */
export interface IGetRideByIdParams {
  id: string;
}

/** 'GetRideById' return type */
export interface IGetRideByIdResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'GetRideById' query type */
export interface IGetRideByIdQuery {
  params: IGetRideByIdParams;
  result: IGetRideByIdResult;
}

const getRideByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":711,"b":714}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * FROM rides
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getRideById = new PreparedQuery<IGetRideByIdParams,IGetRideByIdResult>(getRideByIdIR);


/** 'GetRideByIdForBooker' parameters type */
export interface IGetRideByIdForBookerParams {
  bookedByUserId: string;
  id: string;
}

/** 'GetRideByIdForBooker' return type */
export interface IGetRideByIdForBookerResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'GetRideByIdForBooker' query type */
export interface IGetRideByIdForBookerQuery {
  params: IGetRideByIdForBookerParams;
  result: IGetRideByIdForBookerResult;
}

const getRideByIdForBookerIR: any = {"usedParamSet":{"id":true,"bookedByUserId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":711,"b":714}]},{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":748,"b":763}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE id = :id!::uuid\n  AND booked_by_user_id = :bookedByUserId!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * FROM rides
 * WHERE id = :id!::uuid
 *   AND booked_by_user_id = :bookedByUserId!::uuid
 * LIMIT 1
 * ```
 */
export const getRideByIdForBooker = new PreparedQuery<IGetRideByIdForBookerParams,IGetRideByIdForBookerResult>(getRideByIdForBookerIR);


/** 'ListRidesByBooker' parameters type */
export interface IListRidesByBookerParams {
  bookedByUserId: string;
  limit: NumberOrString;
  offset: NumberOrString;
  status?: ride_status | null | void;
  view?: string | null | void;
}

/** 'ListRidesByBooker' return type */
export interface IListRidesByBookerResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'ListRidesByBooker' query type */
export interface IListRidesByBookerQuery {
  params: IListRidesByBookerParams;
  result: IListRidesByBookerResult;
}

const listRidesByBookerIR: any = {"usedParamSet":{"bookedByUserId":true,"status":true,"view":true,"limit":true,"offset":true},"params":[{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":726,"b":741}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":756,"b":762},{"a":797,"b":803}]},{"name":"view","required":false,"transform":{"type":"scalar"},"locs":[{"a":826,"b":830},{"a":854,"b":858},{"a":933,"b":937},{"a":1023,"b":1027},{"a":1095,"b":1099}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1191,"b":1197}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1206,"b":1213}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE booked_by_user_id = :bookedByUserId!::uuid\n  AND (:status::ride_status IS NULL OR status = :status::ride_status)\n  AND (:view::text IS NULL\n    OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))\n    OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED')))\nORDER BY\n  CASE WHEN :view::text = 'upcoming' THEN pickup_at END ASC NULLS LAST,\n  CASE WHEN :view::text = 'completed' THEN updated_at END DESC NULLS LAST,\n  created_at DESC, id DESC\nLIMIT :limit!\nOFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * FROM rides
 * WHERE booked_by_user_id = :bookedByUserId!::uuid
 *   AND (:status::ride_status IS NULL OR status = :status::ride_status)
 *   AND (:view::text IS NULL
 *     OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))
 *     OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED')))
 * ORDER BY
 *   CASE WHEN :view::text = 'upcoming' THEN pickup_at END ASC NULLS LAST,
 *   CASE WHEN :view::text = 'completed' THEN updated_at END DESC NULLS LAST,
 *   created_at DESC, id DESC
 * LIMIT :limit!
 * OFFSET :offset!
 * ```
 */
export const listRidesByBooker = new PreparedQuery<IListRidesByBookerParams,IListRidesByBookerResult>(listRidesByBookerIR);


/** 'ListRidesAdmin' parameters type */
export interface IListRidesAdminParams {
  category?: vehicle_category | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  status?: ride_status | null | void;
}

/** 'ListRidesAdmin' return type */
export interface IListRidesAdminResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'ListRidesAdmin' query type */
export interface IListRidesAdminQuery {
  params: IListRidesAdminParams;
  result: IListRidesAdminResult;
}

const listRidesAdminIR: any = {"usedParamSet":{"status":true,"category":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":707,"b":713},{"a":748,"b":754}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":777,"b":785},{"a":845,"b":853}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":905,"b":911}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":920,"b":927}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE (:status::ride_status IS NULL OR status = :status::ride_status)\n  AND (:category::vehicle_category IS NULL OR requested_vehicle_category = :category::vehicle_category)\nORDER BY created_at DESC\nLIMIT :limit!\nOFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * FROM rides
 * WHERE (:status::ride_status IS NULL OR status = :status::ride_status)
 *   AND (:category::vehicle_category IS NULL OR requested_vehicle_category = :category::vehicle_category)
 * ORDER BY created_at DESC
 * LIMIT :limit!
 * OFFSET :offset!
 * ```
 */
export const listRidesAdmin = new PreparedQuery<IListRidesAdminParams,IListRidesAdminResult>(listRidesAdminIR);


/** 'UpdateRideStatus' parameters type */
export interface IUpdateRideStatusParams {
  id: string;
  status: ride_status;
}

/** 'UpdateRideStatus' return type */
export interface IUpdateRideStatusResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'UpdateRideStatus' query type */
export interface IUpdateRideStatusQuery {
  params: IUpdateRideStatusParams;
  result: IUpdateRideStatusResult;
}

const updateRideStatusIR: any = {"usedParamSet":{"status":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":26,"b":33}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":62}]}],"statement":"UPDATE rides\nSET status = :status!::ride_status\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rides
 * SET status = :status!::ride_status
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const updateRideStatus = new PreparedQuery<IUpdateRideStatusParams,IUpdateRideStatusResult>(updateRideStatusIR);


/** 'AssignDriverToRide' parameters type */
export interface IAssignDriverToRideParams {
  assignedBy: string;
  driverProfileId: string;
  id: string;
  vehicleId: string;
}

/** 'AssignDriverToRide' return type */
export interface IAssignDriverToRideResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'AssignDriverToRide' query type */
export interface IAssignDriverToRideQuery {
  params: IAssignDriverToRideParams;
  result: IAssignDriverToRideResult;
}

const assignDriverToRideIR: any = {"usedParamSet":{"driverProfileId":true,"vehicleId":true,"assignedBy":true,"id":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":57}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":93}]},{"name":"assignedBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":131}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":219,"b":222}]}],"statement":"UPDATE rides\nSET\n    driver_profile_id = :driverProfileId!::uuid,\n    vehicle_id = :vehicleId!::uuid,\n    assigned_by = :assignedBy!::uuid,\n    assigned_at = CURRENT_TIMESTAMP,\n    status = 'DRIVER_ASSIGNED'\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rides
 * SET
 *     driver_profile_id = :driverProfileId!::uuid,
 *     vehicle_id = :vehicleId!::uuid,
 *     assigned_by = :assignedBy!::uuid,
 *     assigned_at = CURRENT_TIMESTAMP,
 *     status = 'DRIVER_ASSIGNED'
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const assignDriverToRide = new PreparedQuery<IAssignDriverToRideParams,IAssignDriverToRideResult>(assignDriverToRideIR);


/** 'CancelRide' parameters type */
export interface ICancelRideParams {
  cancelledBy: string;
  id: string;
  reason?: string | null | void;
}

/** 'CancelRide' return type */
export interface ICancelRideResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'CancelRide' query type */
export interface ICancelRideQuery {
  params: ICancelRideParams;
  result: ICancelRideResult;
}

const cancelRideIR: any = {"usedParamSet":{"cancelledBy":true,"reason":true,"id":true},"params":[{"name":"cancelledBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":74}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":109,"b":115}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":169}]}],"statement":"UPDATE rides\nSET\n    status = 'CANCELLED',\n    cancelled_by = :cancelledBy!::uuid,\n    cancellation_reason = :reason,\n    cancelled_at = CURRENT_TIMESTAMP\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    bag_count,\n    special_requests,\n    booking_key,\n    booking_payload_hash,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rides
 * SET
 *     status = 'CANCELLED',
 *     cancelled_by = :cancelledBy!::uuid,
 *     cancellation_reason = :reason,
 *     cancelled_at = CURRENT_TIMESTAMP
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     booked_by_user_id,
 *     driver_profile_id,
 *     vehicle_id,
 *     requested_vehicle_category,
 *     passenger_count,
 *     bag_count,
 *     special_requests,
 *     booking_key,
 *     booking_payload_hash,
 *     trip_type,
 *     pickup_address,
 *     pickup_exact_location,
 *     pickup_latitude,
 *     pickup_longitude,
 *     destination_address,
 *     exact_destination,
 *     destination_latitude,
 *     destination_longitude,
 *     distance_km,
 *     estimated_duration_minutes,
 *     pickup_at,
 *     return_at,
 *     estimated_fare,
 *     final_fare,
 *     payment_option,
 *     status,
 *     assigned_by,
 *     assigned_at,
 *     cancelled_by,
 *     cancellation_reason,
 *     cancelled_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const cancelRide = new PreparedQuery<ICancelRideParams,ICancelRideResult>(cancelRideIR);


/** 'GetRideByBookingKey' parameters type */
export interface IGetRideByBookingKeyParams {
  bookedByUserId: string;
  bookingKey: string;
}

/** 'GetRideByBookingKey' return type */
export interface IGetRideByBookingKeyResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'GetRideByBookingKey' query type */
export interface IGetRideByBookingKeyQuery {
  params: IGetRideByBookingKeyParams;
  result: IGetRideByBookingKeyResult;
}

const getRideByBookingKeyIR: any = {"usedParamSet":{"bookedByUserId":true,"bookingKey":true},"params":[{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":59}]},{"name":"bookingKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":94}]}],"statement":"SELECT * FROM rides WHERE booked_by_user_id=:bookedByUserId!::uuid AND booking_key=:bookingKey!::uuid LIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM rides WHERE booked_by_user_id=:bookedByUserId!::uuid AND booking_key=:bookingKey!::uuid LIMIT 1
 * ```
 */
export const getRideByBookingKey = new PreparedQuery<IGetRideByBookingKeyParams,IGetRideByBookingKeyResult>(getRideByBookingKeyIR);


/** 'CountPassengerRides' parameters type */
export interface ICountPassengerRidesParams {
  bookedByUserId: string;
  status?: ride_status | null | void;
  view?: string | null | void;
}

/** 'CountPassengerRides' return type */
export interface ICountPassengerRidesResult {
  completed: number | null;
  total: number | null;
  upcoming: number | null;
}

/** 'CountPassengerRides' query type */
export interface ICountPassengerRidesQuery {
  params: ICountPassengerRidesParams;
  result: ICountPassengerRidesResult;
}

const countPassengerRidesIR: any = {"usedParamSet":{"status":true,"view":true,"bookedByUserId":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":203},{"a":238,"b":244}]},{"name":"view","required":false,"transform":{"type":"scalar"},"locs":[{"a":268,"b":272},{"a":297,"b":301},{"a":377,"b":381}]},{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":498,"b":513}]}],"statement":"SELECT\n COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED'))::int AS upcoming,\n COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'CANCELLED'))::int AS completed,\n COUNT(*) FILTER (WHERE (:status::ride_status IS NULL OR status = :status::ride_status)\n   AND (:view::text IS NULL\n     OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))\n     OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED'))))::int AS total\nFROM rides WHERE booked_by_user_id = :bookedByUserId!::uuid"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *  COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED'))::int AS upcoming,
 *  COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'CANCELLED'))::int AS completed,
 *  COUNT(*) FILTER (WHERE (:status::ride_status IS NULL OR status = :status::ride_status)
 *    AND (:view::text IS NULL
 *      OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))
 *      OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED'))))::int AS total
 * FROM rides WHERE booked_by_user_id = :bookedByUserId!::uuid
 * ```
 */
export const countPassengerRides = new PreparedQuery<ICountPassengerRidesParams,ICountPassengerRidesResult>(countPassengerRidesIR);


