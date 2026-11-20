/** Types generated for queries found in "db/queries/admin/reporting.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type driver_profile_status = 'APPROVED' | 'DRAFT' | 'PENDING_VERIFICATION' | 'REJECTED' | 'SUSPENDED';

export type global_role = 'Admin' | 'Driver' | 'Passenger';

export type payment_option = 'OFFLINE' | 'ONLINE' | 'PARTIAL';

export type payment_status = 'CANCELLED' | 'CREATED' | 'FAILED' | 'PAID' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';

export type payment_type = 'OFFLINE' | 'ONLINE';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type ride_status = 'CANCELLED' | 'COMPLETED' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'IN_PROGRESS' | 'PAYMENT_FAILED' | 'PENDING_ASSIGNMENT' | 'PENDING_PAYMENT';

export type trip_type = 'ONE_WAY' | 'ROUND_TRIP';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

export type vehicle_document_type = 'INSURANCE' | 'OTHER' | 'PERMIT' | 'PUC' | 'RC';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

export type stringArray = (string)[];

/** 'AdminUserCounts' parameters type */
export type IAdminUserCountsParams = void;

/** 'AdminUserCounts' return type */
export interface IAdminUserCountsResult {
  admins: number | null;
  drivers: number | null;
  passengers: number | null;
  total: number | null;
  unselected: number | null;
}

/** 'AdminUserCounts' query type */
export interface IAdminUserCountsQuery {
  params: IAdminUserCountsParams;
  result: IAdminUserCountsResult;
}

const adminUserCountsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT COUNT(*)::int AS total,\n COUNT(*) FILTER (WHERE global_role='Driver')::int AS drivers,\n COUNT(*) FILTER (WHERE global_role='Passenger')::int AS passengers,\n COUNT(*) FILTER (WHERE global_role='Admin')::int AS admins,\n COUNT(*) FILTER (WHERE global_role IS NULL)::int AS unselected FROM users WHERE deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total,
 *  COUNT(*) FILTER (WHERE global_role='Driver')::int AS drivers,
 *  COUNT(*) FILTER (WHERE global_role='Passenger')::int AS passengers,
 *  COUNT(*) FILTER (WHERE global_role='Admin')::int AS admins,
 *  COUNT(*) FILTER (WHERE global_role IS NULL)::int AS unselected FROM users WHERE deleted_at IS NULL
 * ```
 */
export const adminUserCounts = new PreparedQuery<IAdminUserCountsParams,IAdminUserCountsResult>(adminUserCountsIR);


/** 'AdminVehicleCounts' parameters type */
export type IAdminVehicleCountsParams = void;

/** 'AdminVehicleCounts' return type */
export interface IAdminVehicleCountsResult {
  active: number | null;
  total: number | null;
}

/** 'AdminVehicleCounts' query type */
export interface IAdminVehicleCountsQuery {
  params: IAdminVehicleCountsParams;
  result: IAdminVehicleCountsResult;
}

const adminVehicleCountsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM vehicles"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM vehicles
 * ```
 */
export const adminVehicleCounts = new PreparedQuery<IAdminVehicleCountsParams,IAdminVehicleCountsResult>(adminVehicleCountsIR);


/** 'AdminRideCounts' parameters type */
export type IAdminRideCountsParams = void;

/** 'AdminRideCounts' return type */
export interface IAdminRideCountsResult {
  active: number | null;
  awaiting_acceptance: number | null;
  awaiting_assignment: number | null;
  cancelled: number | null;
  completed: number | null;
  confirmed: number | null;
  ongoing: number | null;
  payment_failed: number | null;
  pending_payment: number | null;
  today: number | null;
  total: number | null;
}

/** 'AdminRideCounts' query type */
export interface IAdminRideCountsQuery {
  params: IAdminRideCountsParams;
  result: IAdminRideCountsResult;
}

const adminRideCountsIR: any = {"usedParamSet":{},"params":[],"statement":"WITH operational_rides AS (\n SELECT r.*, CASE WHEN expired.id IS NOT NULL\n THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status\n FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id\n AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'\n AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()\n)\nSELECT COUNT(*)::int AS total,\n COUNT(*) FILTER (WHERE pickup_at >= date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'\n AND pickup_at < (date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata')+INTERVAL '1 day') AT TIME ZONE 'Asia/Kolkata')::int AS today,\n COUNT(*) FILTER (WHERE operational_status IN ('CONFIRMED','IN_PROGRESS'))::int AS active,\n COUNT(*) FILTER (WHERE operational_status='COMPLETED')::int AS completed,\n COUNT(*) FILTER (WHERE operational_status='PENDING_ASSIGNMENT')::int AS awaiting_assignment,\n COUNT(*) FILTER (WHERE operational_status='DRIVER_ASSIGNED')::int AS awaiting_acceptance,\n COUNT(*) FILTER (WHERE operational_status='CONFIRMED')::int AS confirmed,\n COUNT(*) FILTER (WHERE operational_status='IN_PROGRESS')::int AS ongoing,\n COUNT(*) FILTER (WHERE operational_status='CANCELLED')::int AS cancelled,\n COUNT(*) FILTER (WHERE operational_status='PENDING_PAYMENT')::int AS pending_payment,\n COUNT(*) FILTER (WHERE operational_status='PAYMENT_FAILED')::int AS payment_failed FROM operational_rides"};

/**
 * Query generated from SQL:
 * ```
 * WITH operational_rides AS (
 *  SELECT r.*, CASE WHEN expired.id IS NOT NULL
 *  THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 *  FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 *  AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 *  AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
 * )
 * SELECT COUNT(*)::int AS total,
 *  COUNT(*) FILTER (WHERE pickup_at >= date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
 *  AND pickup_at < (date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata')+INTERVAL '1 day') AT TIME ZONE 'Asia/Kolkata')::int AS today,
 *  COUNT(*) FILTER (WHERE operational_status IN ('CONFIRMED','IN_PROGRESS'))::int AS active,
 *  COUNT(*) FILTER (WHERE operational_status='COMPLETED')::int AS completed,
 *  COUNT(*) FILTER (WHERE operational_status='PENDING_ASSIGNMENT')::int AS awaiting_assignment,
 *  COUNT(*) FILTER (WHERE operational_status='DRIVER_ASSIGNED')::int AS awaiting_acceptance,
 *  COUNT(*) FILTER (WHERE operational_status='CONFIRMED')::int AS confirmed,
 *  COUNT(*) FILTER (WHERE operational_status='IN_PROGRESS')::int AS ongoing,
 *  COUNT(*) FILTER (WHERE operational_status='CANCELLED')::int AS cancelled,
 *  COUNT(*) FILTER (WHERE operational_status='PENDING_PAYMENT')::int AS pending_payment,
 *  COUNT(*) FILTER (WHERE operational_status='PAYMENT_FAILED')::int AS payment_failed FROM operational_rides
 * ```
 */
export const adminRideCounts = new PreparedQuery<IAdminRideCountsParams,IAdminRideCountsResult>(adminRideCountsIR);


/** 'AdminVerificationCounts' parameters type */
export type IAdminVerificationCountsParams = void;

/** 'AdminVerificationCounts' return type */
export interface IAdminVerificationCountsResult {
  pending_documents: number | null;
  pending_drivers: number | null;
}

/** 'AdminVerificationCounts' query type */
export interface IAdminVerificationCountsQuery {
  params: IAdminVerificationCountsParams;
  result: IAdminVerificationCountsResult;
}

const adminVerificationCountsIR: any = {"usedParamSet":{},"params":[],"statement":"WITH applications AS (\n SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,\n p.created_at, v.submitted_at,\n CASE WHEN p.status='DRAFT' THEN 'DRAFT'\n WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'\n WHEN v.status='REJECTED' THEN 'REJECTED'\n WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'\n WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,\n COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections\n FROM driver_profiles p JOIN users u ON u.id=p.user_id\n LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications\n WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true\n WHERE u.deleted_at IS NULL\n), classified AS (\n SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections\n THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications\n)\nSELECT (SELECT COUNT(*)::int FROM classified WHERE review_state='PENDING_VERIFICATION') AS pending_drivers,\n ((SELECT COUNT(*) FROM driver_documents d JOIN classified a ON a.id=d.driver_profile_id WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING')+\n (SELECT COUNT(*) FROM vehicle_documents d JOIN vehicles v ON v.id=d.vehicle_id JOIN classified a ON a.id=v.driver_profile_id\n WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING'))::int AS pending_documents"};

/**
 * Query generated from SQL:
 * ```
 * WITH applications AS (
 *  SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 *  p.created_at, v.submitted_at,
 *  CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 *  WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 *  WHEN v.status='REJECTED' THEN 'REJECTED'
 *  WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 *  WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 *  COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 *  FROM driver_profiles p JOIN users u ON u.id=p.user_id
 *  LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 *  WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 *  WHERE u.deleted_at IS NULL
 * ), classified AS (
 *  SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 *  THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
 * )
 * SELECT (SELECT COUNT(*)::int FROM classified WHERE review_state='PENDING_VERIFICATION') AS pending_drivers,
 *  ((SELECT COUNT(*) FROM driver_documents d JOIN classified a ON a.id=d.driver_profile_id WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING')+
 *  (SELECT COUNT(*) FROM vehicle_documents d JOIN vehicles v ON v.id=d.vehicle_id JOIN classified a ON a.id=v.driver_profile_id
 *  WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING'))::int AS pending_documents
 * ```
 */
export const adminVerificationCounts = new PreparedQuery<IAdminVerificationCountsParams,IAdminVerificationCountsResult>(adminVerificationCountsIR);


/** 'AdminListUsers' parameters type */
export interface IAdminListUsersParams {
  accountStatus?: string | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  role?: string | null | void;
  search?: string | null | void;
}

/** 'AdminListUsers' return type */
export interface IAdminListUsersResult {
  created_at: Date;
  email: string | null;
  full_name: string;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  last_login_at: Date | null;
  phone_number: string | null;
}

/** 'AdminListUsers' query type */
export interface IAdminListUsersQuery {
  params: IAdminListUsersParams;
  result: IAdminListUsersResult;
}

const adminListUsersIR: any = {"usedParamSet":{"search":true,"role":true,"accountStatus":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":146,"b":152},{"a":194,"b":200},{"a":238,"b":244},{"a":288,"b":294}]},{"name":"role","required":false,"transform":{"type":"scalar"},"locs":[{"a":316,"b":320},{"a":380,"b":384}]},{"name":"accountStatus","required":false,"transform":{"type":"scalar"},"locs":[{"a":399,"b":412},{"a":432,"b":445},{"a":484,"b":497},{"a":553,"b":566}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":664,"b":670}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":679,"b":686}]}],"statement":"SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'\n OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')\n AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)\n AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)\n OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)\n OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked)) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'
 *  OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')
 *  AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)
 *  AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)
 *  OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)
 *  OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked)) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!
 * ```
 */
export const adminListUsers = new PreparedQuery<IAdminListUsersParams,IAdminListUsersResult>(adminListUsersIR);


/** 'AdminCountUsers' parameters type */
export interface IAdminCountUsersParams {
  accountStatus?: string | null | void;
  role?: string | null | void;
  search?: string | null | void;
}

/** 'AdminCountUsers' return type */
export interface IAdminCountUsersResult {
  total: number | null;
}

/** 'AdminCountUsers' query type */
export interface IAdminCountUsersQuery {
  params: IAdminCountUsersParams;
  result: IAdminCountUsersResult;
}

const adminCountUsersIR: any = {"usedParamSet":{"search":true,"role":true,"accountStatus":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":71,"b":77},{"a":119,"b":125},{"a":163,"b":169},{"a":213,"b":219}]},{"name":"role","required":false,"transform":{"type":"scalar"},"locs":[{"a":241,"b":245},{"a":305,"b":309}]},{"name":"accountStatus","required":false,"transform":{"type":"scalar"},"locs":[{"a":324,"b":337},{"a":357,"b":370},{"a":409,"b":422},{"a":478,"b":491}]}],"statement":"SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'\n OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')\n AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)\n AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)\n OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)\n OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked))"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'
 *  OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')
 *  AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)
 *  AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)
 *  OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)
 *  OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked))
 * ```
 */
export const adminCountUsers = new PreparedQuery<IAdminCountUsersParams,IAdminCountUsersResult>(adminCountUsersIR);


/** 'AdminGetUser' parameters type */
export interface IAdminGetUserParams {
  id: string;
}

/** 'AdminGetUser' return type */
export interface IAdminGetUserResult {
  created_at: Date;
  email: string | null;
  full_name: string;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  last_login_at: Date | null;
  phone_number: string | null;
}

/** 'AdminGetUser' query type */
export interface IAdminGetUserQuery {
  params: IAdminGetUserParams;
  result: IAdminGetUserResult;
}

const adminGetUserIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":128}]}],"statement":"SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE id=:id!::uuid AND deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE id=:id!::uuid AND deleted_at IS NULL
 * ```
 */
export const adminGetUser = new PreparedQuery<IAdminGetUserParams,IAdminGetUserResult>(adminGetUserIR);


/** 'AdminListApplications' parameters type */
export interface IAdminListApplicationsParams {
  limit: NumberOrString;
  offset: NumberOrString;
  search?: string | null | void;
  state?: string | null | void;
}

/** 'AdminListApplications' return type */
export interface IAdminListApplicationsResult {
  application_status: string | null;
  created_at: Date;
  email: string | null;
  full_name: string;
  has_corrections: boolean | null;
  id: string;
  profile_status: driver_profile_status;
  review_state: string | null;
  submitted_at: Date;
  user_id: string;
}

/** 'AdminListApplications' query type */
export interface IAdminListApplicationsQuery {
  params: IAdminListApplicationsParams;
  result: IAdminListApplicationsResult;
}

const adminListApplicationsIR: any = {"usedParamSet":{"state":true,"search":true,"limit":true,"offset":true},"params":[{"name":"state","required":false,"transform":{"type":"scalar"},"locs":[{"a":971,"b":976},{"a":1008,"b":1013}]},{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":1027,"b":1033},{"a":1075,"b":1081},{"a":1118,"b":1124}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1180,"b":1186}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1195,"b":1202}]}],"statement":"WITH applications AS (\n SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,\n p.created_at, v.submitted_at,\n CASE WHEN p.status='DRAFT' THEN 'DRAFT'\n WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'\n WHEN v.status='REJECTED' THEN 'REJECTED'\n WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'\n WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,\n COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections\n FROM driver_profiles p JOIN users u ON u.id=p.user_id\n LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications\n WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true\n WHERE u.deleted_at IS NULL\n), classified AS (\n SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections\n THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications\n)\nSELECT * FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%') ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * WITH applications AS (
 *  SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 *  p.created_at, v.submitted_at,
 *  CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 *  WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 *  WHEN v.status='REJECTED' THEN 'REJECTED'
 *  WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 *  WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 *  COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 *  FROM driver_profiles p JOIN users u ON u.id=p.user_id
 *  LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 *  WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 *  WHERE u.deleted_at IS NULL
 * ), classified AS (
 *  SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 *  THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
 * )
 * SELECT * FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%') ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!
 * ```
 */
export const adminListApplications = new PreparedQuery<IAdminListApplicationsParams,IAdminListApplicationsResult>(adminListApplicationsIR);


/** 'AdminCountApplications' parameters type */
export interface IAdminCountApplicationsParams {
  search?: string | null | void;
  state?: string | null | void;
}

/** 'AdminCountApplications' return type */
export interface IAdminCountApplicationsResult {
  total: number | null;
}

/** 'AdminCountApplications' query type */
export interface IAdminCountApplicationsQuery {
  params: IAdminCountApplicationsParams;
  result: IAdminCountApplicationsResult;
}

const adminCountApplicationsIR: any = {"usedParamSet":{"state":true,"search":true},"params":[{"name":"state","required":false,"transform":{"type":"scalar"},"locs":[{"a":992,"b":997},{"a":1029,"b":1034}]},{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":1048,"b":1054},{"a":1096,"b":1102},{"a":1139,"b":1145}]}],"statement":"WITH applications AS (\n SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,\n p.created_at, v.submitted_at,\n CASE WHEN p.status='DRAFT' THEN 'DRAFT'\n WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'\n WHEN v.status='REJECTED' THEN 'REJECTED'\n WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'\n WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,\n COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections\n FROM driver_profiles p JOIN users u ON u.id=p.user_id\n LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications\n WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true\n WHERE u.deleted_at IS NULL\n), classified AS (\n SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections\n THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications\n)\nSELECT COUNT(*)::int AS total FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%')"};

/**
 * Query generated from SQL:
 * ```
 * WITH applications AS (
 *  SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 *  p.created_at, v.submitted_at,
 *  CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 *  WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 *  WHEN v.status='REJECTED' THEN 'REJECTED'
 *  WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 *  WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 *  COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 *  FROM driver_profiles p JOIN users u ON u.id=p.user_id
 *  LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 *  WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 *  WHERE u.deleted_at IS NULL
 * ), classified AS (
 *  SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 *  THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
 * )
 * SELECT COUNT(*)::int AS total FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%')
 * ```
 */
export const adminCountApplications = new PreparedQuery<IAdminCountApplicationsParams,IAdminCountApplicationsResult>(adminCountApplicationsIR);


/** 'AdminListVehicles' parameters type */
export interface IAdminListVehiclesParams {
  active?: boolean | null | void;
  category?: string | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  search?: string | null | void;
}

/** 'AdminListVehicles' return type */
export interface IAdminListVehiclesResult {
  color: string | null;
  created_at: Date;
  driver_name: string;
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

/** 'AdminListVehicles' query type */
export interface IAdminListVehiclesQuery {
  params: IAdminListVehiclesParams;
  result: IAdminListVehiclesResult;
}

const adminListVehiclesIR: any = {"usedParamSet":{"search":true,"active":true,"category":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":290,"b":296},{"a":345,"b":351},{"a":394,"b":400}]},{"name":"active","required":false,"transform":{"type":"scalar"},"locs":[{"a":422,"b":428},{"a":462,"b":468}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":486,"b":494},{"a":534,"b":542}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":595,"b":601}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":610,"b":617}]}],"statement":"SELECT v.id, v.driver_profile_id, v.vehicle_number, v.vehicle_type, v.make, v.model, v.color, v.manufacturing_year, v.updated_at, v.is_active, v.created_at, u.full_name AS driver_name FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id\n WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')\n AND (:active::boolean IS NULL OR v.is_active=:active::boolean)\n AND (:category::text IS NULL OR v.vehicle_type::text=:category::text) ORDER BY v.created_at DESC, v.id DESC LIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT v.id, v.driver_profile_id, v.vehicle_number, v.vehicle_type, v.make, v.model, v.color, v.manufacturing_year, v.updated_at, v.is_active, v.created_at, u.full_name AS driver_name FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id
 *  WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')
 *  AND (:active::boolean IS NULL OR v.is_active=:active::boolean)
 *  AND (:category::text IS NULL OR v.vehicle_type::text=:category::text) ORDER BY v.created_at DESC, v.id DESC LIMIT :limit! OFFSET :offset!
 * ```
 */
export const adminListVehicles = new PreparedQuery<IAdminListVehiclesParams,IAdminListVehiclesResult>(adminListVehiclesIR);


/** 'AdminCountVehicles' parameters type */
export interface IAdminCountVehiclesParams {
  active?: boolean | null | void;
  category?: string | null | void;
  search?: string | null | void;
}

/** 'AdminCountVehicles' return type */
export interface IAdminCountVehiclesResult {
  total: number | null;
}

/** 'AdminCountVehicles' query type */
export interface IAdminCountVehiclesQuery {
  params: IAdminCountVehiclesParams;
  result: IAdminCountVehiclesResult;
}

const adminCountVehiclesIR: any = {"usedParamSet":{"search":true,"active":true,"category":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":136,"b":142},{"a":191,"b":197},{"a":240,"b":246}]},{"name":"active","required":false,"transform":{"type":"scalar"},"locs":[{"a":268,"b":274},{"a":308,"b":314}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":332,"b":340},{"a":380,"b":388}]}],"statement":"SELECT COUNT(*)::int AS total FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id\n WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')\n AND (:active::boolean IS NULL OR v.is_active=:active::boolean)\n AND (:category::text IS NULL OR v.vehicle_type::text=:category::text)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id
 *  WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')
 *  AND (:active::boolean IS NULL OR v.is_active=:active::boolean)
 *  AND (:category::text IS NULL OR v.vehicle_type::text=:category::text)
 * ```
 */
export const adminCountVehicles = new PreparedQuery<IAdminCountVehiclesParams,IAdminCountVehiclesResult>(adminCountVehiclesIR);


/** 'AdminVehicleDocuments' parameters type */
export interface IAdminVehicleDocumentsParams {
  vehicleIds: stringArray;
}

/** 'AdminVehicleDocuments' return type */
export interface IAdminVehicleDocumentsResult {
  document_type: vehicle_document_type;
  expiry_date: Date | null;
  id: string;
  status: review_status;
  vehicle_id: string;
}

/** 'AdminVehicleDocuments' query type */
export interface IAdminVehicleDocumentsQuery {
  params: IAdminVehicleDocumentsParams;
  result: IAdminVehicleDocumentsResult;
}

const adminVehicleDocumentsIR: any = {"usedParamSet":{"vehicleIds":true},"params":[{"name":"vehicleIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":115}]}],"statement":"SELECT id, vehicle_id, document_type, status, expiry_date FROM vehicle_documents WHERE vehicle_id = ANY(:vehicleIds!::uuid[]) ORDER BY uploaded_at DESC, id DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, vehicle_id, document_type, status, expiry_date FROM vehicle_documents WHERE vehicle_id = ANY(:vehicleIds!::uuid[]) ORDER BY uploaded_at DESC, id DESC
 * ```
 */
export const adminVehicleDocuments = new PreparedQuery<IAdminVehicleDocumentsParams,IAdminVehicleDocumentsResult>(adminVehicleDocumentsIR);


/** 'AdminListPayments' parameters type */
export interface IAdminListPaymentsParams {
  dateFrom?: DateOrString | null | void;
  dateTo?: DateOrString | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  paymentType?: payment_type | null | void;
  status?: payment_status | null | void;
}

/** 'AdminListPayments' return type */
export interface IAdminListPaymentsResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  ride_id: string;
  status: payment_status;
  user_id: string;
  user_name: string;
}

/** 'AdminListPayments' query type */
export interface IAdminListPaymentsQuery {
  params: IAdminListPaymentsParams;
  result: IAdminListPaymentsResult;
}

const adminListPaymentsIR: any = {"usedParamSet":{"status":true,"paymentType":true,"dateFrom":true,"dateTo":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":231,"b":237},{"a":275,"b":281}]},{"name":"paymentType","required":false,"transform":{"type":"scalar"},"locs":[{"a":306,"b":317},{"a":359,"b":370}]},{"name":"dateFrom","required":false,"transform":{"type":"scalar"},"locs":[{"a":393,"b":401},{"a":441,"b":449}]},{"name":"dateTo","required":false,"transform":{"type":"scalar"},"locs":[{"a":471,"b":477},{"a":516,"b":522}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":582,"b":588}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":597,"b":604}]}],"statement":"SELECT p.id, p.ride_id, p.user_id, u.full_name AS user_name, p.payment_type, p.amount, p.currency, p.status, p.provider, p.payment_method, p.paid_at, p.failed_at, p.created_at FROM payments p JOIN users u ON u.id=p.user_id\n WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)\n AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)\n AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)\n AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz) ORDER BY p.created_at DESC, p.id DESC LIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT p.id, p.ride_id, p.user_id, u.full_name AS user_name, p.payment_type, p.amount, p.currency, p.status, p.provider, p.payment_method, p.paid_at, p.failed_at, p.created_at FROM payments p JOIN users u ON u.id=p.user_id
 *  WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)
 *  AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)
 *  AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)
 *  AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz) ORDER BY p.created_at DESC, p.id DESC LIMIT :limit! OFFSET :offset!
 * ```
 */
export const adminListPayments = new PreparedQuery<IAdminListPaymentsParams,IAdminListPaymentsResult>(adminListPaymentsIR);


/** 'AdminPaymentCounts' parameters type */
export interface IAdminPaymentCountsParams {
  dateFrom?: DateOrString | null | void;
  dateTo?: DateOrString | null | void;
  paymentType?: payment_type | null | void;
  status?: payment_status | null | void;
}

/** 'AdminPaymentCounts' return type */
export interface IAdminPaymentCountsResult {
  cash_collected: string | null;
  failed: number | null;
  online_collected: string | null;
  partially_refunded: number | null;
  refunded: number | null;
  successful: number | null;
  total: number | null;
}

/** 'AdminPaymentCounts' query type */
export interface IAdminPaymentCountsQuery {
  params: IAdminPaymentCountsParams;
  result: IAdminPaymentCountsResult;
}

const adminPaymentCountsIR: any = {"usedParamSet":{"status":true,"paymentType":true,"dateFrom":true,"dateTo":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":564,"b":570},{"a":608,"b":614}]},{"name":"paymentType","required":false,"transform":{"type":"scalar"},"locs":[{"a":639,"b":650},{"a":692,"b":703}]},{"name":"dateFrom","required":false,"transform":{"type":"scalar"},"locs":[{"a":726,"b":734},{"a":774,"b":782}]},{"name":"dateTo","required":false,"transform":{"type":"scalar"},"locs":[{"a":804,"b":810},{"a":849,"b":855}]}],"statement":"SELECT COUNT(*)::int AS total,\n COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='ONLINE'),0) AS online_collected,\n COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='OFFLINE'),0) AS cash_collected,\n COUNT(*) FILTER (WHERE p.status='PAID')::int AS successful,\n COUNT(*) FILTER (WHERE p.status='FAILED')::int AS failed,\n COUNT(*) FILTER (WHERE p.status='REFUNDED')::int AS refunded,\n COUNT(*) FILTER (WHERE p.status='PARTIALLY_REFUNDED')::int AS partially_refunded FROM payments p JOIN users u ON u.id=p.user_id\n WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)\n AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)\n AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)\n AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total,
 *  COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='ONLINE'),0) AS online_collected,
 *  COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='OFFLINE'),0) AS cash_collected,
 *  COUNT(*) FILTER (WHERE p.status='PAID')::int AS successful,
 *  COUNT(*) FILTER (WHERE p.status='FAILED')::int AS failed,
 *  COUNT(*) FILTER (WHERE p.status='REFUNDED')::int AS refunded,
 *  COUNT(*) FILTER (WHERE p.status='PARTIALLY_REFUNDED')::int AS partially_refunded FROM payments p JOIN users u ON u.id=p.user_id
 *  WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)
 *  AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)
 *  AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)
 *  AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz)
 * ```
 */
export const adminPaymentCounts = new PreparedQuery<IAdminPaymentCountsParams,IAdminPaymentCountsResult>(adminPaymentCountsIR);


/** 'AdminListOperationalRides' parameters type */
export interface IAdminListOperationalRidesParams {
  category?: vehicle_category | null | void;
  driverProfileId?: string | null | void;
  limit: NumberOrString;
  offset: NumberOrString;
  status?: ride_status | null | void;
  userId?: string | null | void;
  view?: string | null | void;
}

/** 'AdminListOperationalRides' return type */
export interface IAdminListOperationalRidesResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  operational_status: ride_status | null;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'AdminListOperationalRides' query type */
export interface IAdminListOperationalRidesQuery {
  params: IAdminListOperationalRidesParams;
  result: IAdminListOperationalRidesResult;
}

const adminListOperationalRidesIR: any = {"usedParamSet":{"status":true,"category":true,"userId":true,"driverProfileId":true,"view":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":420,"b":426},{"a":471,"b":477}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":498,"b":506},{"a":564,"b":572}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":598,"b":604},{"a":641,"b":647}]},{"name":"driverProfileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":662,"b":677},{"a":745,"b":760},{"a":891,"b":906},{"a":1402,"b":1417},{"a":1614,"b":1629},{"a":1844,"b":1859}]},{"name":"view","required":false,"transform":{"type":"scalar"},"locs":[{"a":700,"b":704},{"a":1235,"b":1239},{"a":1724,"b":1728}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1911,"b":1917}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1926,"b":1933}]}],"statement":"WITH operational_rides AS (\n SELECT r.*, CASE WHEN expired.id IS NOT NULL\n THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status\n FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id\n AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'\n AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()\n)\nSELECT * FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)\n AND (:driverProfileId::uuid IS NULL OR (\n (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(\n SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid\n AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL\n AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')\n OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))\n OR (:view::text='completed' AND operational_status='COMPLETED' AND (\n EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)\n OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)\n AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid\n AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))\n OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid)))) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * WITH operational_rides AS (
 *  SELECT r.*, CASE WHEN expired.id IS NOT NULL
 *  THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 *  FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 *  AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 *  AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
 * )
 * SELECT * FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)
 *  AND (:driverProfileId::uuid IS NULL OR (
 *  (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(
 *  SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid
 *  AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL
 *  AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')
 *  OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))
 *  OR (:view::text='completed' AND operational_status='COMPLETED' AND (
 *  EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)
 *  OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)
 *  AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid
 *  AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))
 *  OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid)))) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!
 * ```
 */
export const adminListOperationalRides = new PreparedQuery<IAdminListOperationalRidesParams,IAdminListOperationalRidesResult>(adminListOperationalRidesIR);


/** 'AdminCountOperationalRides' parameters type */
export interface IAdminCountOperationalRidesParams {
  category?: vehicle_category | null | void;
  driverProfileId?: string | null | void;
  status?: ride_status | null | void;
  userId?: string | null | void;
  view?: string | null | void;
}

/** 'AdminCountOperationalRides' return type */
export interface IAdminCountOperationalRidesResult {
  total: number | null;
}

/** 'AdminCountOperationalRides' query type */
export interface IAdminCountOperationalRidesQuery {
  params: IAdminCountOperationalRidesParams;
  result: IAdminCountOperationalRidesResult;
}

const adminCountOperationalRidesIR: any = {"usedParamSet":{"status":true,"category":true,"userId":true,"driverProfileId":true,"view":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":441,"b":447},{"a":492,"b":498}]},{"name":"category","required":false,"transform":{"type":"scalar"},"locs":[{"a":519,"b":527},{"a":585,"b":593}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":619,"b":625},{"a":662,"b":668}]},{"name":"driverProfileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":683,"b":698},{"a":766,"b":781},{"a":912,"b":927},{"a":1423,"b":1438},{"a":1635,"b":1650},{"a":1865,"b":1880}]},{"name":"view","required":false,"transform":{"type":"scalar"},"locs":[{"a":721,"b":725},{"a":1256,"b":1260},{"a":1745,"b":1749}]}],"statement":"WITH operational_rides AS (\n SELECT r.*, CASE WHEN expired.id IS NOT NULL\n THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status\n FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id\n AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'\n AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()\n)\nSELECT COUNT(*)::int AS total FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)\n AND (:driverProfileId::uuid IS NULL OR (\n (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(\n SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid\n AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL\n AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')\n OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))\n OR (:view::text='completed' AND operational_status='COMPLETED' AND (\n EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)\n OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)\n AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid\n AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))\n OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid))))"};

/**
 * Query generated from SQL:
 * ```
 * WITH operational_rides AS (
 *  SELECT r.*, CASE WHEN expired.id IS NOT NULL
 *  THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 *  FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 *  AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 *  AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
 * )
 * SELECT COUNT(*)::int AS total FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)
 *  AND (:driverProfileId::uuid IS NULL OR (
 *  (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(
 *  SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid
 *  AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL
 *  AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')
 *  OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))
 *  OR (:view::text='completed' AND operational_status='COMPLETED' AND (
 *  EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)
 *  OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)
 *  AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid
 *  AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))
 *  OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid))))
 * ```
 */
export const adminCountOperationalRides = new PreparedQuery<IAdminCountOperationalRidesParams,IAdminCountOperationalRidesResult>(adminCountOperationalRidesIR);


/** 'AdminRecentVerifications' parameters type */
export type IAdminRecentVerificationsParams = void;

/** 'AdminRecentVerifications' return type */
export interface IAdminRecentVerificationsResult {
  application_status: string | null;
  created_at: Date;
  email: string | null;
  full_name: string;
  has_corrections: boolean | null;
  id: string;
  profile_status: driver_profile_status;
  review_state: string | null;
  submitted_at: Date;
  user_id: string;
}

/** 'AdminRecentVerifications' query type */
export interface IAdminRecentVerificationsQuery {
  params: IAdminRecentVerificationsParams;
  result: IAdminRecentVerificationsResult;
}

const adminRecentVerificationsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT p.id,p.user_id,p.status AS profile_status,u.full_name,u.email,p.created_at,v.submitted_at,\n CASE WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' WHEN v.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,\n CASE WHEN v.status='REJECTED' AND cardinality(v.correction_document_ids)>0 THEN 'CORRECTION_REQUESTED'\n WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' ELSE v.status::text END AS review_state,\n cardinality(v.correction_document_ids)>0 AS has_corrections\nFROM driver_profiles p JOIN users u ON u.id=p.user_id\nJOIN LATERAL (SELECT * FROM driver_verifications WHERE driver_profile_id=p.id ORDER BY submitted_at DESC,id DESC LIMIT 1) v ON true\nWHERE u.deleted_at IS NULL ORDER BY v.submitted_at DESC,p.id DESC LIMIT 3"};

/**
 * Query generated from SQL:
 * ```
 * SELECT p.id,p.user_id,p.status AS profile_status,u.full_name,u.email,p.created_at,v.submitted_at,
 *  CASE WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' WHEN v.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 *  CASE WHEN v.status='REJECTED' AND cardinality(v.correction_document_ids)>0 THEN 'CORRECTION_REQUESTED'
 *  WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' ELSE v.status::text END AS review_state,
 *  cardinality(v.correction_document_ids)>0 AS has_corrections
 * FROM driver_profiles p JOIN users u ON u.id=p.user_id
 * JOIN LATERAL (SELECT * FROM driver_verifications WHERE driver_profile_id=p.id ORDER BY submitted_at DESC,id DESC LIMIT 1) v ON true
 * WHERE u.deleted_at IS NULL ORDER BY v.submitted_at DESC,p.id DESC LIMIT 3
 * ```
 */
export const adminRecentVerifications = new PreparedQuery<IAdminRecentVerificationsParams,IAdminRecentVerificationsResult>(adminRecentVerificationsIR);


/** 'AdminGetPayment' parameters type */
export interface IAdminGetPaymentParams {
  id: string;
}

/** 'AdminGetPayment' return type */
export interface IAdminGetPaymentResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
  user_name: string;
}

/** 'AdminGetPayment' query type */
export interface IAdminGetPaymentQuery {
  params: IAdminGetPaymentParams;
  result: IAdminGetPaymentResult;
}

const adminGetPaymentIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":97}]}],"statement":"SELECT p.*,u.full_name AS user_name FROM payments p JOIN users u ON u.id=p.user_id WHERE p.id=:id!::uuid"};

/**
 * Query generated from SQL:
 * ```
 * SELECT p.*,u.full_name AS user_name FROM payments p JOIN users u ON u.id=p.user_id WHERE p.id=:id!::uuid
 * ```
 */
export const adminGetPayment = new PreparedQuery<IAdminGetPaymentParams,IAdminGetPaymentResult>(adminGetPaymentIR);


/** 'AdminVehicleBlockers' parameters type */
export interface IAdminVehicleBlockersParams {
  vehicleId: string;
}

/** 'AdminVehicleBlockers' return type */
export interface IAdminVehicleBlockersResult {
  offer_id: string;
  ride_id: string;
}

/** 'AdminVehicleBlockers' query type */
export interface IAdminVehicleBlockersQuery {
  params: IAdminVehicleBlockersParams;
  result: IAdminVehicleBlockersResult;
}

const adminVehicleBlockersIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":123},{"a":278,"b":288}]}],"statement":"SELECT r.id AS ride_id,o.id AS offer_id FROM rides r LEFT JOIN ride_offers o ON o.ride_id=r.id\n AND o.vehicle_id=:vehicleId!::uuid AND o.released_at IS NULL AND o.cancelled_at IS NULL\n AND ((o.status='PENDING' AND o.expires_at>NOW()) OR o.status='ACCEPTED')\nWHERE (r.vehicle_id=:vehicleId!::uuid AND r.status IN ('CONFIRMED','IN_PROGRESS'))\n OR (o.id IS NOT NULL AND r.status IN ('DRIVER_ASSIGNED','CONFIRMED','IN_PROGRESS'))"};

/**
 * Query generated from SQL:
 * ```
 * SELECT r.id AS ride_id,o.id AS offer_id FROM rides r LEFT JOIN ride_offers o ON o.ride_id=r.id
 *  AND o.vehicle_id=:vehicleId!::uuid AND o.released_at IS NULL AND o.cancelled_at IS NULL
 *  AND ((o.status='PENDING' AND o.expires_at>NOW()) OR o.status='ACCEPTED')
 * WHERE (r.vehicle_id=:vehicleId!::uuid AND r.status IN ('CONFIRMED','IN_PROGRESS'))
 *  OR (o.id IS NOT NULL AND r.status IN ('DRIVER_ASSIGNED','CONFIRMED','IN_PROGRESS'))
 * ```
 */
export const adminVehicleBlockers = new PreparedQuery<IAdminVehicleBlockersParams,IAdminVehicleBlockersResult>(adminVehicleBlockersIR);


/** 'AdminUpdateVehicle' parameters type */
export interface IAdminUpdateVehicleParams {
  active: boolean;
  color?: string | null | void;
  id: string;
  make?: string | null | void;
  manufacturingYear?: number | null | void;
  model?: string | null | void;
  vehicleNumber: string;
  vehicleType: vehicle_category;
}

/** 'AdminUpdateVehicle' return type */
export interface IAdminUpdateVehicleResult {
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
  photos_correction_completed: boolean;
  photos_rejection_reason: string | null;
  photos_review_status: review_status;
  review_revision: number;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'AdminUpdateVehicle' query type */
export interface IAdminUpdateVehicleQuery {
  params: IAdminUpdateVehicleParams;
  result: IAdminUpdateVehicleResult;
}

const adminUpdateVehicleIR: any = {"usedParamSet":{"vehicleNumber":true,"vehicleType":true,"make":true,"model":true,"color":true,"manufacturingYear":true,"active":true,"id":true},"params":[{"name":"vehicleNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":49}]},{"name":"vehicleType","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":76}]},{"name":"make","required":false,"transform":{"type":"scalar"},"locs":[{"a":83,"b":87}]},{"name":"model","required":false,"transform":{"type":"scalar"},"locs":[{"a":95,"b":100}]},{"name":"color","required":false,"transform":{"type":"scalar"},"locs":[{"a":110,"b":115}]},{"name":"manufacturingYear","required":false,"transform":{"type":"scalar"},"locs":[{"a":136,"b":153}]},{"name":"active","required":true,"transform":{"type":"scalar"},"locs":[{"a":165,"b":172}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":186}]}],"statement":"UPDATE vehicles SET vehicle_number=:vehicleNumber!,vehicle_type=:vehicleType!,make=:make,model=:model,\n color=:color,manufacturing_year=:manufacturingYear,is_active=:active! WHERE id=:id!::uuid RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicles SET vehicle_number=:vehicleNumber!,vehicle_type=:vehicleType!,make=:make,model=:model,
 *  color=:color,manufacturing_year=:manufacturingYear,is_active=:active! WHERE id=:id!::uuid RETURNING *
 * ```
 */
export const adminUpdateVehicle = new PreparedQuery<IAdminUpdateVehicleParams,IAdminUpdateVehicleResult>(adminUpdateVehicleIR);


/** 'AdminVehicleAudit' parameters type */
export interface IAdminVehicleAuditParams {
  id: string;
}

/** 'AdminVehicleAudit' return type */
export interface IAdminVehicleAuditResult {
  actor_id: string;
  after_values: Json;
  before_values: Json;
  created_at: Date;
  id: string;
  reason: string | null;
}

/** 'AdminVehicleAudit' query type */
export interface IAdminVehicleAuditQuery {
  params: IAdminVehicleAuditParams;
  result: IAdminVehicleAuditResult;
}

const adminVehicleAuditIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":108}]}],"statement":"SELECT id,actor_id,reason,before_values,after_values,created_at FROM vehicle_edit_audit WHERE vehicle_id=:id!::uuid ORDER BY created_at DESC,id DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id,actor_id,reason,before_values,after_values,created_at FROM vehicle_edit_audit WHERE vehicle_id=:id!::uuid ORDER BY created_at DESC,id DESC
 * ```
 */
export const adminVehicleAudit = new PreparedQuery<IAdminVehicleAuditParams,IAdminVehicleAuditResult>(adminVehicleAuditIR);


/** 'AdminInsertVehicleAudit' parameters type */
export interface IAdminInsertVehicleAuditParams {
  actorId: string;
  after: Json;
  before: Json;
  reason?: string | null | void;
  vehicleId: string;
}

/** 'AdminInsertVehicleAudit' return type */
export type IAdminInsertVehicleAuditResult = void;

/** 'AdminInsertVehicleAudit' query type */
export interface IAdminInsertVehicleAuditQuery {
  params: IAdminInsertVehicleAuditParams;
  result: IAdminInsertVehicleAuditResult;
}

const adminInsertVehicleAuditIR: any = {"usedParamSet":{"vehicleId":true,"actorId":true,"reason":true,"before":true,"after":true},"params":[{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":103}]},{"name":"actorId","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":119}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":133}]},{"name":"before","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":142}]},{"name":"after","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":157}]}],"statement":"INSERT INTO vehicle_edit_audit(vehicle_id,actor_id,reason,before_values,after_values)\nVALUES(:vehicleId!::uuid,:actorId!::uuid,:reason,:before!::jsonb,:after!::jsonb)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO vehicle_edit_audit(vehicle_id,actor_id,reason,before_values,after_values)
 * VALUES(:vehicleId!::uuid,:actorId!::uuid,:reason,:before!::jsonb,:after!::jsonb)
 * ```
 */
export const adminInsertVehicleAudit = new PreparedQuery<IAdminInsertVehicleAuditParams,IAdminInsertVehicleAuditResult>(adminInsertVehicleAuditIR);


