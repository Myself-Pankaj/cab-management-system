/** Types generated for queries found in "db/queries/rides/ride_passengers.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateRidePassenger' parameters type */
export interface ICreateRidePassengerParams {
  isPrimary: boolean;
  name: string;
  phone: string;
  rideId: string;
}

/** 'CreateRidePassenger' return type */
export interface ICreateRidePassengerResult {
  created_at: Date;
  id: string;
  is_primary: boolean;
  name: string;
  phone: string;
  ride_id: string;
}

/** 'CreateRidePassenger' query type */
export interface ICreateRidePassengerQuery {
  params: ICreateRidePassengerParams;
  result: ICreateRidePassengerResult;
}

const createRidePassengerIR: any = {"usedParamSet":{"rideId":true,"name":true,"phone":true,"isPrimary":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":101}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":119}]},{"name":"phone","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":132}]},{"name":"isPrimary","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":149}]}],"statement":"INSERT INTO ride_passengers (\n    ride_id,\n    name,\n    phone,\n    is_primary\n)\nVALUES (\n    :rideId!::uuid,\n    :name!,\n    :phone!,\n    :isPrimary!\n)\nRETURNING\n    id,\n    ride_id,\n    name,\n    phone,\n    is_primary,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ride_passengers (
 *     ride_id,
 *     name,
 *     phone,
 *     is_primary
 * )
 * VALUES (
 *     :rideId!::uuid,
 *     :name!,
 *     :phone!,
 *     :isPrimary!
 * )
 * RETURNING
 *     id,
 *     ride_id,
 *     name,
 *     phone,
 *     is_primary,
 *     created_at
 * ```
 */
export const createRidePassenger = new PreparedQuery<ICreateRidePassengerParams,ICreateRidePassengerResult>(createRidePassengerIR);


/** 'ListPassengersByRideId' parameters type */
export interface IListPassengersByRideIdParams {
  rideId: string;
}

/** 'ListPassengersByRideId' return type */
export interface IListPassengersByRideIdResult {
  created_at: Date;
  id: string;
  is_primary: boolean;
  name: string;
  phone: string;
  ride_id: string;
}

/** 'ListPassengersByRideId' query type */
export interface IListPassengersByRideIdQuery {
  params: IListPassengersByRideIdParams;
  result: IListPassengersByRideIdResult;
}

const listPassengersByRideIdIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":124}]}],"statement":"SELECT\n    id,\n    ride_id,\n    name,\n    phone,\n    is_primary,\n    created_at\nFROM ride_passengers\nWHERE ride_id = :rideId!::uuid\nORDER BY is_primary DESC, created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     name,
 *     phone,
 *     is_primary,
 *     created_at
 * FROM ride_passengers
 * WHERE ride_id = :rideId!::uuid
 * ORDER BY is_primary DESC, created_at ASC
 * ```
 */
export const listPassengersByRideId = new PreparedQuery<IListPassengersByRideIdParams,IListPassengersByRideIdResult>(listPassengersByRideIdIR);


