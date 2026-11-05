/** Types generated for queries found in "db/queries/rides/ride_cancellations.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertRideCancellation' parameters type */
export interface IInsertRideCancellationParams {
  cancelledBy: string;
  reason?: string | null | void;
  refundRequired: boolean;
  rideId: string;
}

/** 'InsertRideCancellation' return type */
export interface IInsertRideCancellationResult {
  cancelled_by: string;
  created_at: Date;
  id: string;
  reason: string | null;
  refund_required: boolean;
  ride_id: string;
}

/** 'InsertRideCancellation' query type */
export interface IInsertRideCancellationQuery {
  params: IInsertRideCancellationParams;
  result: IInsertRideCancellationResult;
}

const insertRideCancellationIR: any = {"usedParamSet":{"rideId":true,"cancelledBy":true,"reason":true,"refundRequired":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":118}]},{"name":"cancelledBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":143}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":156,"b":162}]},{"name":"refundRequired","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":184}]}],"statement":"INSERT INTO ride_cancellations (\n    ride_id,\n    cancelled_by,\n    reason,\n    refund_required\n)\nVALUES (\n    :rideId!::uuid,\n    :cancelledBy!::uuid,\n    :reason,\n    :refundRequired!\n)\nRETURNING\n    id,\n    ride_id,\n    cancelled_by,\n    reason,\n    refund_required,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ride_cancellations (
 *     ride_id,
 *     cancelled_by,
 *     reason,
 *     refund_required
 * )
 * VALUES (
 *     :rideId!::uuid,
 *     :cancelledBy!::uuid,
 *     :reason,
 *     :refundRequired!
 * )
 * RETURNING
 *     id,
 *     ride_id,
 *     cancelled_by,
 *     reason,
 *     refund_required,
 *     created_at
 * ```
 */
export const insertRideCancellation = new PreparedQuery<IInsertRideCancellationParams,IInsertRideCancellationResult>(insertRideCancellationIR);


/** 'GetRideCancellationByRideId' parameters type */
export interface IGetRideCancellationByRideIdParams {
  rideId: string;
}

/** 'GetRideCancellationByRideId' return type */
export interface IGetRideCancellationByRideIdResult {
  cancelled_by: string;
  created_at: Date;
  id: string;
  reason: string | null;
  refund_required: boolean;
  ride_id: string;
}

/** 'GetRideCancellationByRideId' query type */
export interface IGetRideCancellationByRideIdQuery {
  params: IGetRideCancellationByRideIdParams;
  result: IGetRideCancellationByRideIdResult;
}

const getRideCancellationByRideIdIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":141}]}],"statement":"SELECT\n    id,\n    ride_id,\n    cancelled_by,\n    reason,\n    refund_required,\n    created_at\nFROM ride_cancellations\nWHERE ride_id = :rideId!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     cancelled_by,
 *     reason,
 *     refund_required,
 *     created_at
 * FROM ride_cancellations
 * WHERE ride_id = :rideId!::uuid
 * LIMIT 1
 * ```
 */
export const getRideCancellationByRideId = new PreparedQuery<IGetRideCancellationByRideIdParams,IGetRideCancellationByRideIdResult>(getRideCancellationByRideIdIR);


