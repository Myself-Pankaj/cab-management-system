/** Types generated for queries found in "db/queries/rides/ride_status_history.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ride_status = 'CANCELLED' | 'COMPLETED' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'IN_PROGRESS' | 'PAYMENT_FAILED' | 'PENDING_ASSIGNMENT' | 'PENDING_PAYMENT';

/** 'InsertRideStatusHistory' parameters type */
export interface IInsertRideStatusHistoryParams {
  changedBy?: string | null | void;
  newStatus: ride_status;
  note?: string | null | void;
  oldStatus?: ride_status | null | void;
  rideId: string;
}

/** 'InsertRideStatusHistory' return type */
export interface IInsertRideStatusHistoryResult {
  changed_by: string | null;
  created_at: Date;
  id: string;
  new_status: ride_status;
  note: string | null;
  old_status: ride_status | null;
  ride_id: string;
}

/** 'InsertRideStatusHistory' query type */
export interface IInsertRideStatusHistoryQuery {
  params: IInsertRideStatusHistoryParams;
  result: IInsertRideStatusHistoryResult;
}

const insertRideStatusHistoryIR: any = {"usedParamSet":{"rideId":true,"oldStatus":true,"newStatus":true,"changedBy":true,"note":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126}]},{"name":"oldStatus","required":false,"transform":{"type":"scalar"},"locs":[{"a":139,"b":148}]},{"name":"newStatus","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":178}]},{"name":"changedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":198,"b":207}]},{"name":"note","required":false,"transform":{"type":"scalar"},"locs":[{"a":220,"b":224}]}],"statement":"INSERT INTO ride_status_history (\n    ride_id,\n    old_status,\n    new_status,\n    changed_by,\n    note\n)\nVALUES (\n    :rideId!::uuid,\n    :oldStatus::ride_status,\n    :newStatus!::ride_status,\n    :changedBy::uuid,\n    :note\n)\nRETURNING\n    id,\n    ride_id,\n    old_status,\n    new_status,\n    changed_by,\n    note,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ride_status_history (
 *     ride_id,
 *     old_status,
 *     new_status,
 *     changed_by,
 *     note
 * )
 * VALUES (
 *     :rideId!::uuid,
 *     :oldStatus::ride_status,
 *     :newStatus!::ride_status,
 *     :changedBy::uuid,
 *     :note
 * )
 * RETURNING
 *     id,
 *     ride_id,
 *     old_status,
 *     new_status,
 *     changed_by,
 *     note,
 *     created_at
 * ```
 */
export const insertRideStatusHistory = new PreparedQuery<IInsertRideStatusHistoryParams,IInsertRideStatusHistoryResult>(insertRideStatusHistoryIR);


/** 'ListRideStatusHistory' parameters type */
export interface IListRideStatusHistoryParams {
  rideId: string;
}

/** 'ListRideStatusHistory' return type */
export interface IListRideStatusHistoryResult {
  changed_by: string | null;
  created_at: Date;
  id: string;
  new_status: ride_status;
  note: string | null;
  old_status: ride_status | null;
  ride_id: string;
}

/** 'ListRideStatusHistory' query type */
export interface IListRideStatusHistoryQuery {
  params: IListRideStatusHistoryParams;
  result: IListRideStatusHistoryResult;
}

const listRideStatusHistoryIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]}],"statement":"SELECT\n    id,\n    ride_id,\n    old_status,\n    new_status,\n    changed_by,\n    note,\n    created_at\nFROM ride_status_history\nWHERE ride_id = :rideId!::uuid\nORDER BY created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     old_status,
 *     new_status,
 *     changed_by,
 *     note,
 *     created_at
 * FROM ride_status_history
 * WHERE ride_id = :rideId!::uuid
 * ORDER BY created_at ASC
 * ```
 */
export const listRideStatusHistory = new PreparedQuery<IListRideStatusHistoryParams,IListRideStatusHistoryResult>(listRideStatusHistoryIR);


