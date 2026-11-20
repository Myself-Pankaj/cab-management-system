/** Types generated for queries found in "db/queries/drivers/driver_documents.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type driver_document_type = 'AADHAAR' | 'DRIVING_LICENCE' | 'OTHER' | 'PAN' | 'POLICE_VERIFICATION';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'CreateDriverDocument' parameters type */
export interface ICreateDriverDocumentParams {
  documentNumber?: string | null | void;
  documentType: driver_document_type;
  driverProfileId: string;
  expiryDate?: DateOrString | null | void;
  status?: review_status | null | void;
}

/** 'CreateDriverDocument' return type */
export interface ICreateDriverDocumentResult {
  correction: Json | null;
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
}

/** 'CreateDriverDocument' query type */
export interface ICreateDriverDocumentQuery {
  params: ICreateDriverDocumentParams;
  result: ICreateDriverDocumentResult;
}

const createDriverDocumentIR: any = {"usedParamSet":{"driverProfileId":true,"documentType":true,"documentNumber":true,"expiryDate":true,"status":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":137,"b":153}]},{"name":"documentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":179}]},{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":208,"b":222}]},{"name":"expiryDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":229,"b":239}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":261,"b":267}]}],"statement":"INSERT INTO driver_documents (\n    driver_profile_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status\n)\nVALUES (\n    :driverProfileId!::uuid,\n    :documentType!::driver_document_type,\n    :documentNumber,\n    :expiryDate::date,\n    COALESCE(:status::review_status, 'PENDING'::review_status)\n)\nRETURNING\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction,\n    expiry_date"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_documents (
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status
 * )
 * VALUES (
 *     :driverProfileId!::uuid,
 *     :documentType!::driver_document_type,
 *     :documentNumber,
 *     :expiryDate::date,
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
 *     reviewed_at,
 *     revision,
 *     correction,
 *     expiry_date
 * ```
 */
export const createDriverDocument = new PreparedQuery<ICreateDriverDocumentParams,ICreateDriverDocumentResult>(createDriverDocumentIR);


/** 'ListDriverDocumentsByProfileId' parameters type */
export interface IListDriverDocumentsByProfileIdParams {
  driverProfileId: string;
}

/** 'ListDriverDocumentsByProfileId' return type */
export interface IListDriverDocumentsByProfileIdResult {
  correction: Json | null;
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
}

/** 'ListDriverDocumentsByProfileId' query type */
export interface IListDriverDocumentsByProfileIdQuery {
  params: IListDriverDocumentsByProfileIdParams;
  result: IListDriverDocumentsByProfileIdResult;
}

const listDriverDocumentsByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":256}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction,\n    expiry_date\nFROM driver_documents\nWHERE driver_profile_id = :driverProfileId!::uuid\nORDER BY uploaded_at DESC"};

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
 *     reviewed_at,
 *     revision,
 *     correction,
 *     expiry_date
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
  correction: Json | null;
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
}

/** 'GetDriverDocumentById' query type */
export interface IGetDriverDocumentByIdQuery {
  params: IGetDriverDocumentByIdParams;
  result: IGetDriverDocumentByIdResult;
}

const getDriverDocumentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":225,"b":228}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction,\n    expiry_date\nFROM driver_documents\nWHERE id = :id!::uuid\nLIMIT 1"};

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
 *     reviewed_at,
 *     revision,
 *     correction,
 *     expiry_date
 * FROM driver_documents
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverDocumentById = new PreparedQuery<IGetDriverDocumentByIdParams,IGetDriverDocumentByIdResult>(getDriverDocumentByIdIR);


/** 'UpdateDriverDocumentReview' parameters type */
export interface IUpdateDriverDocumentReviewParams {
  correction?: Json | null | void;
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'UpdateDriverDocumentReview' return type */
export interface IUpdateDriverDocumentReviewResult {
  correction: Json | null;
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
}

/** 'UpdateDriverDocumentReview' query type */
export interface IUpdateDriverDocumentReviewQuery {
  params: IUpdateDriverDocumentReviewParams;
  result: IUpdateDriverDocumentReviewResult;
}

const updateDriverDocumentReviewIR: any = {"usedParamSet":{"status":true,"rejectionReason":true,"correction":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":48}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":104}]},{"name":"correction","required":false,"transform":{"type":"scalar"},"locs":[{"a":178,"b":188}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":208,"b":211}]}],"statement":"UPDATE driver_documents\nSET\n    status = :status!::review_status,\n    rejection_reason = :rejectionReason,\n    reviewed_at = NOW(),\n    revision = revision + 1,\n    correction = :correction::jsonb\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    driver_profile_id,\n    document_type,\n    document_number,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction,\n    expiry_date"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE driver_documents
 * SET
 *     status = :status!::review_status,
 *     rejection_reason = :rejectionReason,
 *     reviewed_at = NOW(),
 *     revision = revision + 1,
 *     correction = :correction::jsonb
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     document_type,
 *     document_number,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at,
 *     revision,
 *     correction,
 *     expiry_date
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


/** 'SaveDriverDocumentState' parameters type */
export interface ISaveDriverDocumentStateParams {
  correction?: Json | null | void;
  documentNumber?: string | null | void;
  expectedRevision: number;
  expiryDate?: DateOrString | null | void;
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'SaveDriverDocumentState' return type */
export interface ISaveDriverDocumentStateResult {
  correction: Json | null;
  document_number: string | null;
  document_type: driver_document_type;
  driver_profile_id: string;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
}

/** 'SaveDriverDocumentState' query type */
export interface ISaveDriverDocumentStateQuery {
  params: ISaveDriverDocumentStateParams;
  result: ISaveDriverDocumentStateResult;
}

const saveDriverDocumentStateIR: any = {"usedParamSet":{"documentNumber":true,"expiryDate":true,"status":true,"rejectionReason":true,"correction":true,"id":true,"expectedRevision":true},"params":[{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":45,"b":59}]},{"name":"expiryDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":75,"b":85}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":109},{"a":218,"b":225}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":145,"b":160}]},{"name":"correction","required":false,"transform":{"type":"scalar"},"locs":[{"a":175,"b":185}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":315,"b":318}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":339,"b":356}]}],"statement":"UPDATE driver_documents SET\n document_number=:documentNumber,\n expiry_date=:expiryDate::date,\n status=:status!::review_status,\n rejection_reason=:rejectionReason,\n correction=:correction::jsonb,\n reviewed_at=CASE WHEN :status!::review_status='REJECTED' THEN reviewed_at ELSE NULL END,\n revision=revision+1\nWHERE id=:id!::uuid AND revision=:expectedRevision!::integer\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE driver_documents SET
 *  document_number=:documentNumber,
 *  expiry_date=:expiryDate::date,
 *  status=:status!::review_status,
 *  rejection_reason=:rejectionReason,
 *  correction=:correction::jsonb,
 *  reviewed_at=CASE WHEN :status!::review_status='REJECTED' THEN reviewed_at ELSE NULL END,
 *  revision=revision+1
 * WHERE id=:id!::uuid AND revision=:expectedRevision!::integer
 * RETURNING *
 * ```
 */
export const saveDriverDocumentState = new PreparedQuery<ISaveDriverDocumentStateParams,ISaveDriverDocumentStateResult>(saveDriverDocumentStateIR);


