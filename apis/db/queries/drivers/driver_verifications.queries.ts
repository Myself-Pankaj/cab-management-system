/** Types generated for queries found in "db/queries/drivers/driver_verifications.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

/** 'CreateDriverVerification' parameters type */
export interface ICreateDriverVerificationParams {
  driverProfileId: string;
}

/** 'CreateDriverVerification' return type */
export interface ICreateDriverVerificationResult {
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  status: review_status;
  submitted_at: Date;
}

/** 'CreateDriverVerification' query type */
export interface ICreateDriverVerificationQuery {
  params: ICreateDriverVerificationParams;
  result: ICreateDriverVerificationResult;
}

const createDriverVerificationIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":118}]}],"statement":"INSERT INTO driver_verifications (\n    driver_profile_id,\n    status,\n    submitted_at\n)\nVALUES (\n    :driverProfileId!::uuid,\n    'PENDING'::review_status,\n    NOW()\n)\nRETURNING\n    id,\n    driver_profile_id,\n    status,\n    reviewed_by,\n    rejection_reason,\n    submitted_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_verifications (
 *     driver_profile_id,
 *     status,
 *     submitted_at
 * )
 * VALUES (
 *     :driverProfileId!::uuid,
 *     'PENDING'::review_status,
 *     NOW()
 * )
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     status,
 *     reviewed_by,
 *     rejection_reason,
 *     submitted_at,
 *     reviewed_at
 * ```
 */
export const createDriverVerification = new PreparedQuery<ICreateDriverVerificationParams,ICreateDriverVerificationResult>(createDriverVerificationIR);


/** 'GetLatestDriverVerificationByProfileId' parameters type */
export interface IGetLatestDriverVerificationByProfileIdParams {
  driverProfileId: string;
}

/** 'GetLatestDriverVerificationByProfileId' return type */
export interface IGetLatestDriverVerificationByProfileIdResult {
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  status: review_status;
  submitted_at: Date;
}

/** 'GetLatestDriverVerificationByProfileId' query type */
export interface IGetLatestDriverVerificationByProfileIdQuery {
  params: IGetLatestDriverVerificationByProfileIdParams;
  result: IGetLatestDriverVerificationByProfileIdResult;
}

const getLatestDriverVerificationByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":175,"b":191}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    status,\n    reviewed_by,\n    rejection_reason,\n    submitted_at,\n    reviewed_at\nFROM driver_verifications\nWHERE driver_profile_id = :driverProfileId!::uuid\nORDER BY submitted_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     status,
 *     reviewed_by,
 *     rejection_reason,
 *     submitted_at,
 *     reviewed_at
 * FROM driver_verifications
 * WHERE driver_profile_id = :driverProfileId!::uuid
 * ORDER BY submitted_at DESC
 * LIMIT 1
 * ```
 */
export const getLatestDriverVerificationByProfileId = new PreparedQuery<IGetLatestDriverVerificationByProfileIdParams,IGetLatestDriverVerificationByProfileIdResult>(getLatestDriverVerificationByProfileIdIR);


/** 'UpdateDriverVerificationReview' parameters type */
export interface IUpdateDriverVerificationReviewParams {
  id: string;
  rejectionReason?: string | null | void;
  reviewedBy?: string | null | void;
  status: review_status;
}

/** 'UpdateDriverVerificationReview' return type */
export interface IUpdateDriverVerificationReviewResult {
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  status: review_status;
  submitted_at: Date;
}

/** 'UpdateDriverVerificationReview' query type */
export interface IUpdateDriverVerificationReviewQuery {
  params: IUpdateDriverVerificationReviewParams;
  result: IUpdateDriverVerificationReviewResult;
}

const updateDriverVerificationReviewIR: any = {"usedParamSet":{"status":true,"reviewedBy":true,"rejectionReason":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":45,"b":52}]},{"name":"reviewedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":98}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":145}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":186}]}],"statement":"UPDATE driver_verifications\nSET\n    status = :status!::review_status,\n    reviewed_by = :reviewedBy::uuid,\n    rejection_reason = :rejectionReason,\n    reviewed_at = NOW()\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    driver_profile_id,\n    status,\n    reviewed_by,\n    rejection_reason,\n    submitted_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE driver_verifications
 * SET
 *     status = :status!::review_status,
 *     reviewed_by = :reviewedBy::uuid,
 *     rejection_reason = :rejectionReason,
 *     reviewed_at = NOW()
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     status,
 *     reviewed_by,
 *     rejection_reason,
 *     submitted_at,
 *     reviewed_at
 * ```
 */
export const updateDriverVerificationReview = new PreparedQuery<IUpdateDriverVerificationReviewParams,IUpdateDriverVerificationReviewResult>(updateDriverVerificationReviewIR);


