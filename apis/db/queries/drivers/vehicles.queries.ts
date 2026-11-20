/** Types generated for queries found in "db/queries/drivers/vehicles.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

export type stringArray = (string)[];

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
  details_rejection_reason: string | null;
  details_review_status: review_status;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  photos_correction_baseline: stringArray;
  photos_correction_completed: boolean;
  photos_rejection_reason: string | null;
  photos_review_status: review_status;
  review_revision: number;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'CreateVehicle' query type */
export interface ICreateVehicleQuery {
  params: ICreateVehicleParams;
  result: ICreateVehicleResult;
}

const createVehicleIR: any = {"usedParamSet":{"driverProfileId":true,"vehicleNumber":true,"vehicleType":true,"make":true,"model":true,"color":true,"manufacturingYear":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":170}]},{"name":"vehicleNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":197}]},{"name":"vehicleType","required":false,"transform":{"type":"scalar"},"locs":[{"a":204,"b":215}]},{"name":"make","required":false,"transform":{"type":"scalar"},"locs":[{"a":222,"b":226}]},{"name":"model","required":false,"transform":{"type":"scalar"},"locs":[{"a":233,"b":238}]},{"name":"color","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":250}]},{"name":"manufacturingYear","required":false,"transform":{"type":"scalar"},"locs":[{"a":257,"b":274}]}],"statement":"INSERT INTO vehicles (\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year\n)\nVALUES (\n    :driverProfileId!::uuid,\n    :vehicleNumber!,\n    :vehicleType,\n    :make,\n    :model,\n    :color,\n    :manufacturingYear\n)\nRETURNING\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    details_review_status,\n    photos_review_status,\n    details_rejection_reason,\n    photos_rejection_reason,\n    photos_correction_completed,\n    photos_correction_baseline,\n    review_revision,\n    is_active,\n    created_at,\n    updated_at"};

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
 *     details_review_status,
 *     photos_review_status,
 *     details_rejection_reason,
 *     photos_rejection_reason,
 *     photos_correction_completed,
 *     photos_correction_baseline,
 *     review_revision,
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
  details_rejection_reason: string | null;
  details_review_status: review_status;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  photos_correction_baseline: stringArray;
  photos_correction_completed: boolean;
  photos_rejection_reason: string | null;
  photos_review_status: review_status;
  review_revision: number;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'ListVehiclesByProfileId' query type */
export interface IListVehiclesByProfileIdQuery {
  params: IListVehiclesByProfileIdParams;
  result: IListVehiclesByProfileIdResult;
}

const listVehiclesByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":416,"b":432}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    details_review_status,\n    photos_review_status,\n    details_rejection_reason,\n    photos_rejection_reason,\n    photos_correction_completed,\n    photos_correction_baseline,\n    review_revision,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicles\nWHERE driver_profile_id = :driverProfileId!::uuid\nORDER BY created_at DESC"};

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
 *     details_review_status,
 *     photos_review_status,
 *     details_rejection_reason,
 *     photos_rejection_reason,
 *     photos_correction_completed,
 *     photos_correction_baseline,
 *     review_revision,
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
  details_rejection_reason: string | null;
  details_review_status: review_status;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  photos_correction_baseline: stringArray;
  photos_correction_completed: boolean;
  photos_rejection_reason: string | null;
  photos_review_status: review_status;
  review_revision: number;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'GetVehicleById' query type */
export interface IGetVehicleByIdQuery {
  params: IGetVehicleByIdParams;
  result: IGetVehicleByIdResult;
}

const getVehicleByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":401,"b":404}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    vehicle_number,\n    vehicle_type,\n    make,\n    model,\n    color,\n    manufacturing_year,\n    details_review_status,\n    photos_review_status,\n    details_rejection_reason,\n    photos_rejection_reason,\n    photos_correction_completed,\n    photos_correction_baseline,\n    review_revision,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicles\nWHERE id = :id!::uuid\nLIMIT 1"};

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
 *     details_review_status,
 *     photos_review_status,
 *     details_rejection_reason,
 *     photos_rejection_reason,
 *     photos_correction_completed,
 *     photos_correction_baseline,
 *     review_revision,
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


/** 'ReviewVehicleGroup' parameters type */
export interface IReviewVehicleGroupParams {
  id: string;
  increment: boolean;
  reason?: string | null | void;
  reviewGroup: string;
  status: review_status;
}

/** 'ReviewVehicleGroup' return type */
export type IReviewVehicleGroupResult = void;

/** 'ReviewVehicleGroup' query type */
export interface IReviewVehicleGroupQuery {
  params: IReviewVehicleGroupParams;
  result: IReviewVehicleGroupResult;
}

const reviewVehicleGroupIR: any = {"usedParamSet":{"reviewGroup":true,"status":true,"reason":true,"increment":true,"id":true},"params":[{"name":"reviewGroup","required":true,"transform":{"type":"scalar"},"locs":[{"a":53,"b":65},{"a":176,"b":188},{"a":301,"b":313},{"a":420,"b":432},{"a":624,"b":636},{"a":765,"b":777}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":95},{"a":210,"b":217}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":336,"b":342},{"a":454,"b":460}]},{"name":"increment","required":true,"transform":{"type":"scalar"},"locs":[{"a":545,"b":555},{"a":657,"b":667},{"a":798,"b":808}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":892,"b":895},{"a":949,"b":952}]}],"statement":"UPDATE vehicles SET\n details_review_status=CASE WHEN :reviewGroup!::text='DETAILS' THEN :status!::review_status ELSE details_review_status END,\n photos_review_status=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :status!::review_status ELSE photos_review_status END,\n details_rejection_reason=CASE WHEN :reviewGroup!::text='DETAILS' THEN :reason::text ELSE details_rejection_reason END,\n photos_rejection_reason=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :reason::text ELSE photos_rejection_reason END,\n review_revision=review_revision+CASE WHEN :increment!::boolean THEN 1 ELSE 0 END,\n photos_correction_completed=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN FALSE ELSE photos_correction_completed END,\n photos_correction_baseline=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN ARRAY(SELECT id FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid) ELSE photos_correction_baseline END\nWHERE id=:id!::uuid"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicles SET
 *  details_review_status=CASE WHEN :reviewGroup!::text='DETAILS' THEN :status!::review_status ELSE details_review_status END,
 *  photos_review_status=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :status!::review_status ELSE photos_review_status END,
 *  details_rejection_reason=CASE WHEN :reviewGroup!::text='DETAILS' THEN :reason::text ELSE details_rejection_reason END,
 *  photos_rejection_reason=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :reason::text ELSE photos_rejection_reason END,
 *  review_revision=review_revision+CASE WHEN :increment!::boolean THEN 1 ELSE 0 END,
 *  photos_correction_completed=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN FALSE ELSE photos_correction_completed END,
 *  photos_correction_baseline=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN ARRAY(SELECT id FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid) ELSE photos_correction_baseline END
 * WHERE id=:id!::uuid
 * ```
 */
export const reviewVehicleGroup = new PreparedQuery<IReviewVehicleGroupParams,IReviewVehicleGroupResult>(reviewVehicleGroupIR);


/** 'MarkVehiclePhotosCorrected' parameters type */
export interface IMarkVehiclePhotosCorrectedParams {
  id: string;
}

/** 'MarkVehiclePhotosCorrected' return type */
export type IMarkVehiclePhotosCorrectedResult = void;

/** 'MarkVehiclePhotosCorrected' query type */
export interface IMarkVehiclePhotosCorrectedQuery {
  params: IMarkVehiclePhotosCorrectedParams;
  result: IMarkVehiclePhotosCorrectedResult;
}

const markVehiclePhotosCorrectedIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":121},{"a":193,"b":196}]}],"statement":"UPDATE vehicles SET photos_correction_completed=EXISTS(\n SELECT 1 FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid\n AND NOT(id=ANY(vehicles.photos_correction_baseline)))\nWHERE id=:id!::uuid AND photos_review_status='REJECTED'"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicles SET photos_correction_completed=EXISTS(
 *  SELECT 1 FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid
 *  AND NOT(id=ANY(vehicles.photos_correction_baseline)))
 * WHERE id=:id!::uuid AND photos_review_status='REJECTED'
 * ```
 */
export const markVehiclePhotosCorrected = new PreparedQuery<IMarkVehiclePhotosCorrectedParams,IMarkVehiclePhotosCorrectedResult>(markVehiclePhotosCorrectedIR);


