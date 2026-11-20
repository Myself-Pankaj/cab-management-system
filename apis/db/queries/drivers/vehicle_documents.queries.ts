/** Types generated for queries found in "db/queries/drivers/vehicle_documents.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type vehicle_document_type = 'INSURANCE' | 'OTHER' | 'PERMIT' | 'PUC' | 'RC';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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
  correction: Json | null;
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'CreateVehicleDocument' query type */
export interface ICreateVehicleDocumentQuery {
  params: ICreateVehicleDocumentParams;
  result: ICreateVehicleDocumentResult;
}

const createVehicleDocumentIR: any = {"usedParamSet":{"vehicleId":true,"documentType":true,"documentNumber":true,"expiryDate":true,"status":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":141}]},{"name":"documentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":167}]},{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":197,"b":211}]},{"name":"expiryDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":228}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":244,"b":250}]}],"statement":"INSERT INTO vehicle_documents (\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status\n)\nVALUES (\n    :vehicleId!::uuid,\n    :documentType!::vehicle_document_type,\n    :documentNumber,\n    :expiryDate,\n    COALESCE(:status::review_status, 'PENDING'::review_status)\n)\nRETURNING\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction"};

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
 *     reviewed_at,
 *     revision,
 *     correction
 * ```
 */
export const createVehicleDocument = new PreparedQuery<ICreateVehicleDocumentParams,ICreateVehicleDocumentResult>(createVehicleDocumentIR);


/** 'ListVehicleDocumentsByVehicleId' parameters type */
export interface IListVehicleDocumentsByVehicleIdParams {
  vehicleId: string;
}

/** 'ListVehicleDocumentsByVehicleId' return type */
export interface IListVehicleDocumentsByVehicleIdResult {
  correction: Json | null;
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'ListVehicleDocumentsByVehicleId' query type */
export interface IListVehicleDocumentsByVehicleIdQuery {
  params: IListVehicleDocumentsByVehicleIdParams;
  result: IListVehicleDocumentsByVehicleIdResult;
}

const listVehicleDocumentsByVehicleIdIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":227,"b":237}]}],"statement":"SELECT\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction\nFROM vehicle_documents\nWHERE vehicle_id = :vehicleId!::uuid\nORDER BY uploaded_at DESC"};

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
 *     reviewed_at,
 *     revision,
 *     correction
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
  correction: Json | null;
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'GetVehicleDocumentById' query type */
export interface IGetVehicleDocumentByIdQuery {
  params: IGetVehicleDocumentByIdParams;
  result: IGetVehicleDocumentByIdResult;
}

const getVehicleDocumentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":219,"b":222}]}],"statement":"SELECT\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction\nFROM vehicle_documents\nWHERE id = :id!::uuid\nLIMIT 1"};

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
 *     reviewed_at,
 *     revision,
 *     correction
 * FROM vehicle_documents
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getVehicleDocumentById = new PreparedQuery<IGetVehicleDocumentByIdParams,IGetVehicleDocumentByIdResult>(getVehicleDocumentByIdIR);


/** 'UpdateVehicleDocumentReview' parameters type */
export interface IUpdateVehicleDocumentReviewParams {
  correction?: Json | null | void;
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'UpdateVehicleDocumentReview' return type */
export interface IUpdateVehicleDocumentReviewResult {
  correction: Json | null;
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'UpdateVehicleDocumentReview' query type */
export interface IUpdateVehicleDocumentReviewQuery {
  params: IUpdateVehicleDocumentReviewParams;
  result: IUpdateVehicleDocumentReviewResult;
}

const updateVehicleDocumentReviewIR: any = {"usedParamSet":{"status":true,"rejectionReason":true,"correction":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":49}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":90,"b":105}]},{"name":"correction","required":false,"transform":{"type":"scalar"},"locs":[{"a":179,"b":189}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":209,"b":212}]}],"statement":"UPDATE vehicle_documents\nSET\n    status = :status!::review_status,\n    rejection_reason = :rejectionReason,\n    reviewed_at = NOW(),\n    revision = revision + 1,\n    correction = :correction::jsonb\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    vehicle_id,\n    document_type,\n    document_number,\n    expiry_date,\n    status,\n    rejection_reason,\n    uploaded_at,\n    reviewed_at,\n    revision,\n    correction"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicle_documents
 * SET
 *     status = :status!::review_status,
 *     rejection_reason = :rejectionReason,
 *     reviewed_at = NOW(),
 *     revision = revision + 1,
 *     correction = :correction::jsonb
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
 *     reviewed_at,
 *     revision,
 *     correction
 * ```
 */
export const updateVehicleDocumentReview = new PreparedQuery<IUpdateVehicleDocumentReviewParams,IUpdateVehicleDocumentReviewResult>(updateVehicleDocumentReviewIR);


/** 'SaveVehicleDocumentState' parameters type */
export interface ISaveVehicleDocumentStateParams {
  correction?: Json | null | void;
  documentNumber?: string | null | void;
  expectedRevision: number;
  expiryDate?: DateOrString | null | void;
  id: string;
  rejectionReason?: string | null | void;
  status: review_status;
}

/** 'SaveVehicleDocumentState' return type */
export interface ISaveVehicleDocumentStateResult {
  correction: Json | null;
  document_number: string | null;
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  revision: number;
  status: review_status;
  uploaded_at: Date;
  vehicle_id: string;
}

/** 'SaveVehicleDocumentState' query type */
export interface ISaveVehicleDocumentStateQuery {
  params: ISaveVehicleDocumentStateParams;
  result: ISaveVehicleDocumentStateResult;
}

const saveVehicleDocumentStateIR: any = {"usedParamSet":{"documentNumber":true,"expiryDate":true,"status":true,"rejectionReason":true,"correction":true,"id":true,"expectedRevision":true},"params":[{"name":"documentNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":46,"b":60}]},{"name":"expiryDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":76,"b":86}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":110},{"a":219,"b":226}]},{"name":"rejectionReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":146,"b":161}]},{"name":"correction","required":false,"transform":{"type":"scalar"},"locs":[{"a":176,"b":186}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":316,"b":319}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":340,"b":357}]}],"statement":"UPDATE vehicle_documents SET\n document_number=:documentNumber,\n expiry_date=:expiryDate::date,\n status=:status!::review_status,\n rejection_reason=:rejectionReason,\n correction=:correction::jsonb,\n reviewed_at=CASE WHEN :status!::review_status='REJECTED' THEN reviewed_at ELSE NULL END,\n revision=revision+1\nWHERE id=:id!::uuid AND revision=:expectedRevision!::integer\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicle_documents SET
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
export const saveVehicleDocumentState = new PreparedQuery<ISaveVehicleDocumentStateParams,ISaveVehicleDocumentStateResult>(saveVehicleDocumentStateIR);


