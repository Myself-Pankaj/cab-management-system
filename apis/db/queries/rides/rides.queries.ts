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
  bookedByUserId: string;
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
  status: ride_status;
  tripType: trip_type;
}

/** 'CreateRide' return type */
export interface ICreateRideResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  booked_by_user_id: string;
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

const createRideIR: any = {"usedParamSet":{"bookedByUserId":true,"requestedVehicleCategory":true,"passengerCount":true,"tripType":true,"pickupAddress":true,"pickupExactLocation":true,"pickupLatitude":true,"pickupLongitude":true,"destinationAddress":true,"exactDestination":true,"destinationLatitude":true,"destinationLongitude":true,"distanceKm":true,"estimatedDurationMinutes":true,"pickupAt":true,"returnAt":true,"estimatedFare":true,"paymentOption":true,"status":true},"params":[{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":447,"b":462}]},{"name":"requestedVehicleCategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":475,"b":500}]},{"name":"passengerCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":525,"b":540}]},{"name":"tripType","required":true,"transform":{"type":"scalar"},"locs":[{"a":547,"b":556}]},{"name":"pickupAddress","required":true,"transform":{"type":"scalar"},"locs":[{"a":574,"b":588}]},{"name":"pickupExactLocation","required":false,"transform":{"type":"scalar"},"locs":[{"a":595,"b":614}]},{"name":"pickupLatitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":621,"b":636}]},{"name":"pickupLongitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":643,"b":659}]},{"name":"destinationAddress","required":true,"transform":{"type":"scalar"},"locs":[{"a":666,"b":685}]},{"name":"exactDestination","required":false,"transform":{"type":"scalar"},"locs":[{"a":692,"b":708}]},{"name":"destinationLatitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":715,"b":735}]},{"name":"destinationLongitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":742,"b":763}]},{"name":"distanceKm","required":true,"transform":{"type":"scalar"},"locs":[{"a":770,"b":781}]},{"name":"estimatedDurationMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":788,"b":813}]},{"name":"pickupAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":820,"b":829}]},{"name":"returnAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":836,"b":844}]},{"name":"estimatedFare","required":true,"transform":{"type":"scalar"},"locs":[{"a":851,"b":865}]},{"name":"paymentOption","required":true,"transform":{"type":"scalar"},"locs":[{"a":872,"b":886}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":909,"b":916}]}],"statement":"INSERT INTO rides (\n    booked_by_user_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    payment_option,\n    status\n)\nVALUES (\n    :bookedByUserId!::uuid,\n    :requestedVehicleCategory!::vehicle_category,\n    :passengerCount!,\n    :tripType!::trip_type,\n    :pickupAddress!,\n    :pickupExactLocation,\n    :pickupLatitude!,\n    :pickupLongitude!,\n    :destinationAddress!,\n    :exactDestination,\n    :destinationLatitude!,\n    :destinationLongitude!,\n    :distanceKm!,\n    :estimatedDurationMinutes!,\n    :pickupAt!,\n    :returnAt,\n    :estimatedFare!,\n    :paymentOption!::payment_option,\n    :status!::ride_status\n)\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rides (
 *     booked_by_user_id,
 *     requested_vehicle_category,
 *     passenger_count,
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
  booked_by_user_id: string;
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

const getRideByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":631,"b":634}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE id = :id!::uuid\nLIMIT 1"};

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
  booked_by_user_id: string;
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

const getRideByIdForBookerIR: any = {"usedParamSet":{"id":true,"bookedByUserId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":631,"b":634}]},{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":668,"b":683}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE id = :id!::uuid\n  AND booked_by_user_id = :bookedByUserId!::uuid\nLIMIT 1"};

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
}

/** 'ListRidesByBooker' return type */
export interface IListRidesByBookerResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  booked_by_user_id: string;
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

const listRidesByBookerIR: any = {"usedParamSet":{"bookedByUserId":true,"status":true,"limit":true,"offset":true},"params":[{"name":"bookedByUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":646,"b":661}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":676,"b":682},{"a":717,"b":723}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":770,"b":776}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":785,"b":792}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE booked_by_user_id = :bookedByUserId!::uuid\n  AND (:status::ride_status IS NULL OR status = :status::ride_status)\nORDER BY created_at DESC\nLIMIT :limit!\nOFFSET :offset!"};

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
 * ORDER BY created_at DESC
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
  booked_by_user_id: string;
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

const listRidesAdminIR: any = {"usedParamSet":{"status":true,"category":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":627,"b":633},{"a":668,"b":674}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":697,"b":705},{"a":765,"b":773}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":825,"b":831}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":840,"b":847}]}],"statement":"SELECT\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at\nFROM rides\nWHERE (:status::ride_status IS NULL OR status = :status::ride_status)\n  AND (:category::vehicle_category IS NULL OR requested_vehicle_category = :category::vehicle_category)\nORDER BY created_at DESC\nLIMIT :limit!\nOFFSET :offset!"};

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
  booked_by_user_id: string;
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

const updateRideStatusIR: any = {"usedParamSet":{"status":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":26,"b":33}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":62}]}],"statement":"UPDATE rides\nSET status = :status!::ride_status\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

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
  booked_by_user_id: string;
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

const assignDriverToRideIR: any = {"usedParamSet":{"driverProfileId":true,"vehicleId":true,"assignedBy":true,"id":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":57}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":93}]},{"name":"assignedBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":131}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":219,"b":222}]}],"statement":"UPDATE rides\nSET\n    driver_profile_id = :driverProfileId!::uuid,\n    vehicle_id = :vehicleId!::uuid,\n    assigned_by = :assignedBy!::uuid,\n    assigned_at = CURRENT_TIMESTAMP,\n    status = 'DRIVER_ASSIGNED'\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

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
  booked_by_user_id: string;
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

const cancelRideIR: any = {"usedParamSet":{"cancelledBy":true,"reason":true,"id":true},"params":[{"name":"cancelledBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":74}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":109,"b":115}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":169}]}],"statement":"UPDATE rides\nSET\n    status = 'CANCELLED',\n    cancelled_by = :cancelledBy!::uuid,\n    cancellation_reason = :reason,\n    cancelled_at = CURRENT_TIMESTAMP\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    booked_by_user_id,\n    driver_profile_id,\n    vehicle_id,\n    requested_vehicle_category,\n    passenger_count,\n    trip_type,\n    pickup_address,\n    pickup_exact_location,\n    pickup_latitude,\n    pickup_longitude,\n    destination_address,\n    exact_destination,\n    destination_latitude,\n    destination_longitude,\n    distance_km,\n    estimated_duration_minutes,\n    pickup_at,\n    return_at,\n    estimated_fare,\n    final_fare,\n    payment_option,\n    status,\n    assigned_by,\n    assigned_at,\n    cancelled_by,\n    cancellation_reason,\n    cancelled_at,\n    created_at,\n    updated_at"};

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


