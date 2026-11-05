/** Types generated for queries found in "db/queries/drivers/vehicles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

/** 'CreateVehicle' parameters type */
export interface ICreateVehicleParams {
  color?: string | null | void;
  driverProfileId: string;
  make?: string | null | void;
  manufacturingYear?: number | null | void;
  model?: string | null | void;
  vehicleNumber: string;
  vehicleType?: vehicle_category | null | void;
}

/** 'CreateVehicle' return type */
export interface ICreateVehicleResult {
  color: string | null;
  created_at: Date;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'CreateVehicle' query type */
export interface ICreateVehicleQuery {
  params: ICreateVehicleParams;
  result: ICreateVehicleResult;
}

const createVehicleIR: any = {"usedParamSet":{"driverProfileId":true,"vehicleNumber":true,"vehicleType":true,"make":true,"model":true,"color":true,"manufacturingYear":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":170}]},{"name":"vehicleNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":197}]},{"name":"vehicleType","required":false,"transform":{"type":"scalar"},"locs":[{"a":204,"b":215}]},{"name":"make","required":false,"transform":{"type":"scalar"},"locs":[{"a":222,"b":226}]},{"name":"model","required":false,"transform":{"type":"scalar"},"locs":[{"a":233,"b":238}]},{"name":"color","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":250}]},{"name":"manufacturingYear","required":false,"transform":{"type":"scalar"},"locs":[{"a":257,"b":274}]}],"statement":"INSERT INTO vehicles (\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year\n)\nVALUES (\n    :driverProfileId!::uuid,\n    :vehicleNumber!,\n    :vehicleType,\n    :make,\n    :model,\n    :color,\n    :manufacturingYear\n)\nRETURNING\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    is_active,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO vehicles (
 *     driver_profile_id,
 *     vehicle_number,
 *     vehicle_type,
 *     make,
 *     model,
 *     color,
 *     manufacturing_year
 * )
 * VALUES (
 *     :driverProfileId!::uuid,
 *     :vehicleNumber!,
 *     :vehicleType,
 *     :make,
 *     :model,
 *     :color,
 *     :manufacturingYear
 * )
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     vehicle_number,
 *     vehicle_type,
 *     make,
 *     model,
 *     color,
 *     manufacturing_year,
 *     is_active,
 *     created_at,
 *     updated_at
 * ```
 */
export const createVehicle = new PreparedQuery<ICreateVehicleParams,ICreateVehicleResult>(createVehicleIR);


/** 'ListVehiclesByProfileId' parameters type */
export interface IListVehiclesByProfileIdParams {
  driverProfileId: string;
}

/** 'ListVehiclesByProfileId' return type */
export interface IListVehiclesByProfileIdResult {
  color: string | null;
  created_at: Date;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'ListVehiclesByProfileId' query type */
export interface IListVehiclesByProfileIdQuery {
  params: IListVehiclesByProfileIdParams;
  result: IListVehiclesByProfileIdResult;
}

const listVehiclesByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":234}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicles\nWHERE driver_profile_id = :driverProfileId!::uuid\nORDER BY created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     vehicle_number,
 *     vehicle_type,
 *     make,
 *     model,
 *     color,
 *     manufacturing_year,
 *     is_active,
 *     created_at,
 *     updated_at
 * FROM vehicles
 * WHERE driver_profile_id = :driverProfileId!::uuid
 * ORDER BY created_at DESC
 * ```
 */
export const listVehiclesByProfileId = new PreparedQuery<IListVehiclesByProfileIdParams,IListVehiclesByProfileIdResult>(listVehiclesByProfileIdIR);


/** 'GetVehicleById' parameters type */
export interface IGetVehicleByIdParams {
  id: string;
}

/** 'GetVehicleById' return type */
export interface IGetVehicleByIdResult {
  color: string | null;
  created_at: Date;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'GetVehicleById' query type */
export interface IGetVehicleByIdQuery {
  params: IGetVehicleByIdParams;
  result: IGetVehicleByIdResult;
}

const getVehicleByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":203,"b":206}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicles\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     vehicle_number,
 *     vehicle_type,
 *     make,
 *     model,
 *     color,
 *     manufacturing_year,
 *     is_active,
 *     created_at,
 *     updated_at
 * FROM vehicles
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getVehicleById = new PreparedQuery<IGetVehicleByIdParams,IGetVehicleByIdResult>(getVehicleByIdIR);


/** 'CountActiveVehiclesByProfileId' parameters type */
export interface ICountActiveVehiclesByProfileIdParams {
  driverProfileId: string;
}

/** 'CountActiveVehiclesByProfileId' return type */
export interface ICountActiveVehiclesByProfileIdResult {
  count: number;
}

/** 'CountActiveVehiclesByProfileId' query type */
export interface ICountActiveVehiclesByProfileIdQuery {
  params: ICountActiveVehiclesByProfileIdParams;
  result: ICountActiveVehiclesByProfileIdResult;
}

const countActiveVehiclesByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":89}]}],"statement":"SELECT COUNT(*)::int AS \"count!\"\nFROM vehicles\nWHERE driver_profile_id = :driverProfileId!::uuid\n  AND is_active = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS "count!"
 * FROM vehicles
 * WHERE driver_profile_id = :driverProfileId!::uuid
 *   AND is_active = TRUE
 * ```
 */
export const countActiveVehiclesByProfileId = new PreparedQuery<ICountActiveVehiclesByProfileIdParams,ICountActiveVehiclesByProfileIdResult>(countActiveVehiclesByProfileIdIR);


