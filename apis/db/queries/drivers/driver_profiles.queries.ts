/** Types generated for queries found in "db/queries/drivers/driver_profiles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type driver_profile_status = 'APPROVED' | 'DRAFT' | 'PENDING_VERIFICATION' | 'REJECTED' | 'SUSPENDED';

/** 'CreateDriverProfile' parameters type */
export interface ICreateDriverProfileParams {
  status: driver_profile_status;
  userId: string;
}

/** 'CreateDriverProfile' return type */
export interface ICreateDriverProfileResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'CreateDriverProfile' query type */
export interface ICreateDriverProfileQuery {
  params: ICreateDriverProfileParams;
  result: ICreateDriverProfileResult;
}

const createDriverProfileIR: any = {"usedParamSet":{"userId":true,"status":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":61}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":77}]}],"statement":"INSERT INTO driver_profiles (user_id, status)\nVALUES (:userId!::uuid, :status!::driver_profile_status)\nRETURNING\n    id,\n    user_id,\n    status,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_profiles (user_id, status)
 * VALUES (:userId!::uuid, :status!::driver_profile_status)
 * RETURNING
 *     id,
 *     user_id,
 *     status,
 *     created_at,
 *     updated_at
 * ```
 */
export const createDriverProfile = new PreparedQuery<ICreateDriverProfileParams,ICreateDriverProfileResult>(createDriverProfileIR);


/** 'GetDriverProfileByUserId' parameters type */
export interface IGetDriverProfileByUserIdParams {
  userId: string;
}

/** 'GetDriverProfileByUserId' return type */
export interface IGetDriverProfileByUserIdResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'GetDriverProfileByUserId' query type */
export interface IGetDriverProfileByUserIdQuery {
  params: IGetDriverProfileByUserIdParams;
  result: IGetDriverProfileByUserIdResult;
}

const getDriverProfileByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":115}]}],"statement":"SELECT\n    id,\n    user_id,\n    status,\n    created_at,\n    updated_at\nFROM driver_profiles\nWHERE user_id = :userId!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     status,
 *     created_at,
 *     updated_at
 * FROM driver_profiles
 * WHERE user_id = :userId!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverProfileByUserId = new PreparedQuery<IGetDriverProfileByUserIdParams,IGetDriverProfileByUserIdResult>(getDriverProfileByUserIdIR);


/** 'GetDriverProfileById' parameters type */
export interface IGetDriverProfileByIdParams {
  id: string;
}

/** 'GetDriverProfileById' return type */
export interface IGetDriverProfileByIdResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'GetDriverProfileById' query type */
export interface IGetDriverProfileByIdQuery {
  params: IGetDriverProfileByIdParams;
  result: IGetDriverProfileByIdResult;
}

const getDriverProfileByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":106}]}],"statement":"SELECT\n    id,\n    user_id,\n    status,\n    created_at,\n    updated_at\nFROM driver_profiles\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     status,
 *     created_at,
 *     updated_at
 * FROM driver_profiles
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverProfileById = new PreparedQuery<IGetDriverProfileByIdParams,IGetDriverProfileByIdResult>(getDriverProfileByIdIR);


/** 'ListPendingDriverProfiles' parameters type */
export type IListPendingDriverProfilesParams = void;

/** 'ListPendingDriverProfiles' return type */
export interface IListPendingDriverProfilesResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'ListPendingDriverProfiles' query type */
export interface IListPendingDriverProfilesQuery {
  params: IListPendingDriverProfilesParams;
  result: IListPendingDriverProfilesResult;
}

const listPendingDriverProfilesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    id,\n    user_id,\n    status,\n    created_at,\n    updated_at\nFROM driver_profiles\nWHERE status = 'PENDING_VERIFICATION'::driver_profile_status\nORDER BY updated_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     status,
 *     created_at,
 *     updated_at
 * FROM driver_profiles
 * WHERE status = 'PENDING_VERIFICATION'::driver_profile_status
 * ORDER BY updated_at ASC
 * ```
 */
export const listPendingDriverProfiles = new PreparedQuery<IListPendingDriverProfilesParams,IListPendingDriverProfilesResult>(listPendingDriverProfilesIR);


/** 'UpdateDriverProfileStatus' parameters type */
export interface IUpdateDriverProfileStatusParams {
  id: string;
  status: driver_profile_status;
}

/** 'UpdateDriverProfileStatus' return type */
export interface IUpdateDriverProfileStatusResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'UpdateDriverProfileStatus' query type */
export interface IUpdateDriverProfileStatusQuery {
  params: IUpdateDriverProfileStatusParams;
  result: IUpdateDriverProfileStatusResult;
}

const updateDriverProfileStatusIR: any = {"usedParamSet":{"status":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":40,"b":47}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":110}]}],"statement":"UPDATE driver_profiles\nSET\n    status = :status!::driver_profile_status,\n    updated_at = NOW()\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    user_id,\n    status,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE driver_profiles
 * SET
 *     status = :status!::driver_profile_status,
 *     updated_at = NOW()
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     user_id,
 *     status,
 *     created_at,
 *     updated_at
 * ```
 */
export const updateDriverProfileStatus = new PreparedQuery<IUpdateDriverProfileStatusParams,IUpdateDriverProfileStatusResult>(updateDriverProfileStatusIR);


