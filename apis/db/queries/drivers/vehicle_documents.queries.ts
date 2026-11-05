/** Types generated for queries found in "db/queries/drivers/vehicle_documents.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type vehicle_document_type = 'INSURANCE' | 'OTHER' | 'PERMIT' | 'PUC' | 'RC';

export type DateOrString = Date | string;

/** 'CreateVehicleDocument' parameters type */
export interface ICreateVehicleDocumentParams {
  documentNumber?: string | null | void;
  documentType: vehicle_document_type;
  expiryDate?: DateOrString | null | void;
  status?: review_status | null | void;
  vehicleId: string;
}

/** 'CreateVehicleDocument' return type */
export interface ICreateVehicleDocumentResult {
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'CreateVehicleDocument' query type */
export interface ICreateVehicleDocumentQuery {
  params: ICreateVehicleDocumentParams;
  result: ICreateVehicleDocumentResult;
}

const createVehicleDocumentIR: any = {"usedParamSet":{"vehicleId":true,"documentType":true,"documentNumber":true,"expiryDate":true,"status":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":141}]},{"name":"documentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":167}]},{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":211}]},{"name":"expiryDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":228}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":244,"b":250}]}],"statement":"INSERT INTO vehicle_documents (\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status\n)\nVALUES (\n    :vehicleId!::uuid,\n    :documentType!::vehicle_document_type,\n    :documentNumber,\n    :expiryDate,\n    COALESCE(:status::review_status, 'PENDING'::review_status)\n)\nRETURNING\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO vehicle_documents (
 *     vehicle_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status
 * )
 * VALUES (
 *     :vehicleId!::uuid,
 *     :documentType!::vehicle_document_type,
 *     :documentNumber,
 *     :expiryDate,
 *     COALESCE(:status::review_status, 'PENDING'::review_status)
 * )
 * RETURNING
 *     id,
 *     vehicle_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * ```
 */
export const createVehicleDocument = new PreparedQuery<ICreateVehicleDocumentParams,ICreateVehicleDocumentResult>(createVehicleDocumentIR);


/** 'ListVehicleDocumentsByVehicleId' parameters type */
export interface IListVehicleDocumentsByVehicleIdParams {
  vehicleId: string;
}

/** 'ListVehicleDocumentsByVehicleId' return type */
export interface IListVehicleDocumentsByVehicleIdResult {
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'ListVehicleDocumentsByVehicleId' query type */
export interface IListVehicleDocumentsByVehicleIdQuery {
  params: IListVehicleDocumentsByVehicleIdParams;
  result: IListVehicleDocumentsByVehicleIdResult;
}

const listVehicleDocumentsByVehicleIdIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":197,"b":207}]}],"statement":"SELECT\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at\nFROM vehicle_documents\nWHERE vehicle_id = :vehicleId!::uuid\nORDER BY uploaded_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     vehicle_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * FROM vehicle_documents
 * WHERE vehicle_id = :vehicleId!::uuid
 * ORDER BY uploaded_at DESC
 * ```
 */
export const listVehicleDocumentsByVehicleId = new PreparedQuery<IListVehicleDocumentsByVehicleIdParams,IListVehicleDocumentsByVehicleIdResult>(listVehicleDocumentsByVehicleIdIR);


/** 'GetVehicleDocumentById' parameters type */
export interface IGetVehicleDocumentByIdParams {
  id: string;
}

/** 'GetVehicleDocumentById' return type */
export interface IGetVehicleDocumentByIdResult {
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'GetVehicleDocumentById' query type */
export interface IGetVehicleDocumentByIdQuery {
  params: IGetVehicleDocumentByIdParams;
  result: IGetVehicleDocumentByIdResult;
}

const getVehicleDocumentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":189,"b":192}]}],"statement":"SELECT\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at\nFROM vehicle_documents\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     vehicle_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * FROM vehicle_documents
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getVehicleDocumentById = new PreparedQuery<IGetVehicleDocumentByIdParams,IGetVehicleDocumentByIdResult>(getVehicleDocumentByIdIR);


/** 'UpdateVehicleDocumentReview' parameters type */
export interface IUpdateVehicleDocumentReviewParams {
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'UpdateVehicleDocumentReview' return type */
export interface IUpdateVehicleDocumentReviewResult {
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'UpdateVehicleDocumentReview' query type */
export interface IUpdateVehicleDocumentReviewQuery {
  params: IUpdateVehicleDocumentReviewParams;
  result: IUpdateVehicleDocumentReviewResult;
}

const updateVehicleDocumentReviewIR: any = {"usedParamSet":{"status":true,"rejectionReason":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":49}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":90,"b":105}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":146}]}],"statement":"UPDATE vehicle_documents\nSET\n    status = :status!::review_status,\n    rejection_reason = :rejectionReason,\n    reviewed_at = NOW()\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicle_documents
 * SET
 *     status = :status!::review_status,
 *     rejection_reason = :rejectionReason,
 *     reviewed_at = NOW()
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     vehicle_id,
 *     document_type,
 *     document_number,
 *     expiry_date,
 *     status,
 *     rejection_reason,
 *     uploaded_at,
 *     reviewed_at
 * ```
 */
export const updateVehicleDocumentReview = new PreparedQuery<IUpdateVehicleDocumentReviewParams,IUpdateVehicleDocumentReviewResult>(updateVehicleDocumentReviewIR);


