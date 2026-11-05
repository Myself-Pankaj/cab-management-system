/** Types generated for queries found in "db/queries/drivers/driver_documents.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type driver_document_type = 'AADHAAR' | 'DRIVING_LICENCE' | 'OTHER' | 'PAN' | 'POLICE_VERIFICATION';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

/** 'CreateDriverDocument' parameters type */
export interface ICreateDriverDocumentParams {
  documentNumber?: string | null | void;
  documentType: driver_document_type;
  driverProfileId: string;
  status?: review_status | null | void;
}

/** 'CreateDriverDocument' return type */
export interface ICreateDriverDocumentResult {
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
}

/** 'CreateDriverDocument' query type */
export interface ICreateDriverDocumentQuery {
  params: ICreateDriverDocumentParams;
  result: ICreateDriverDocumentResult;
}

const createDriverDocumentIR: any = {"usedParamSet":{"driverProfileId":true,"documentType":true,"documentNumber":true,"status":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":136}]},{"name":"documentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":162}]},{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":191,"b":205}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":221,"b":227}]}],"statement":"INSERT INTO driver_documents (\n    driver_profile_id,\n    document_type,\n    document_number,\n    status\n)\nVALUES (\n    :driverProfileId!::uuid,\n    :documentType!::driver_document_type,\n    :documentNumber,\n    COALESCE(:status::review_status, 'PENDING'::review_status)\n)\nRETURNING\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_documents (
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status
 * )
 * VALUES (
 *     :driverProfileId!::uuid,
 *     :documentType!::driver_document_type,
 *     :documentNumber,
 *     COALESCE(:status::review_status, 'PENDING'::review_status)
 * )
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * ```
 */
export const createDriverDocument = new PreparedQuery<ICreateDriverDocumentParams,ICreateDriverDocumentResult>(createDriverDocumentIR);


/** 'ListDriverDocumentsByProfileId' parameters type */
export interface IListDriverDocumentsByProfileIdParams {
  driverProfileId: string;
}

/** 'ListDriverDocumentsByProfileId' return type */
export interface IListDriverDocumentsByProfileIdResult {
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
}

/** 'ListDriverDocumentsByProfileId' query type */
export interface IListDriverDocumentsByProfileIdQuery {
  params: IListDriverDocumentsByProfileIdParams;
  result: IListDriverDocumentsByProfileIdResult;
}

const listDriverDocumentsByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":209}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at\nFROM driver_documents\nWHERE driver_profile_id = :driverProfileId!::uuid\nORDER BY uploaded_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * FROM driver_documents
 * WHERE driver_profile_id = :driverProfileId!::uuid
 * ORDER BY uploaded_at DESC
 * ```
 */
export const listDriverDocumentsByProfileId = new PreparedQuery<IListDriverDocumentsByProfileIdParams,IListDriverDocumentsByProfileIdResult>(listDriverDocumentsByProfileIdIR);


/** 'GetDriverDocumentById' parameters type */
export interface IGetDriverDocumentByIdParams {
  id: string;
}

/** 'GetDriverDocumentById' return type */
export interface IGetDriverDocumentByIdResult {
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
}

/** 'GetDriverDocumentById' query type */
export interface IGetDriverDocumentByIdQuery {
  params: IGetDriverDocumentByIdParams;
  result: IGetDriverDocumentByIdResult;
}

const getDriverDocumentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":181}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at\nFROM driver_documents\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * FROM driver_documents
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverDocumentById = new PreparedQuery<IGetDriverDocumentByIdParams,IGetDriverDocumentByIdResult>(getDriverDocumentByIdIR);


/** 'UpdateDriverDocumentReview' parameters type */
export interface IUpdateDriverDocumentReviewParams {
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'UpdateDriverDocumentReview' return type */
export interface IUpdateDriverDocumentReviewResult {
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
}

/** 'UpdateDriverDocumentReview' query type */
export interface IUpdateDriverDocumentReviewQuery {
  params: IUpdateDriverDocumentReviewParams;
  result: IUpdateDriverDocumentReviewResult;
}

const updateDriverDocumentReviewIR: any = {"usedParamSet":{"status":true,"rejectionReason":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":48}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":104}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":145}]}],"statement":"UPDATE driver_documents\nSET\n    status = :status!::review_status,\n    rejection_reason = :rejectionReason,\n    reviewed_at = NOW()\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE driver_documents
 * SET
 *     status = :status!::review_status,
 *     rejection_reason = :rejectionReason,
 *     reviewed_at = NOW()
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * ```
 */
export const updateDriverDocumentReview = new PreparedQuery<IUpdateDriverDocumentReviewParams,IUpdateDriverDocumentReviewResult>(updateDriverDocumentReviewIR);


/** 'DeleteRejectedDriverDocumentByType' parameters type */
export interface IDeleteRejectedDriverDocumentByTypeParams {
  documentType: driver_document_type;
  driverProfileId: string;
}

/** 'DeleteRejectedDriverDocumentByType' return type */
export type IDeleteRejectedDriverDocumentByTypeResult = void;

/** 'DeleteRejectedDriverDocumentByType' query type */
export interface IDeleteRejectedDriverDocumentByTypeQuery {
  params: IDeleteRejectedDriverDocumentByTypeParams;
  result: IDeleteRejectedDriverDocumentByTypeResult;
}

const deleteRejectedDriverDocumentByTypeIR: any = {"usedParamSet":{"driverProfileId":true,"documentType":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":71}]},{"name":"documentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":114}]}],"statement":"DELETE FROM driver_documents\nWHERE driver_profile_id = :driverProfileId!::uuid\n  AND document_type = :documentType!::driver_document_type\n  AND status = 'REJECTED'::review_status"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM driver_documents
 * WHERE driver_profile_id = :driverProfileId!::uuid
 *   AND document_type = :documentType!::driver_document_type
 *   AND status = 'REJECTED'::review_status
 * ```
 */
export const deleteRejectedDriverDocumentByType = new PreparedQuery<IDeleteRejectedDriverDocumentByTypeParams,IDeleteRejectedDriverDocumentByTypeResult>(deleteRejectedDriverDocumentByTypeIR);


