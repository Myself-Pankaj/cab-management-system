/** Types generated for queries found in "db/queries/users/users.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type auth_provider = 'apple' | 'email' | 'google' | 'phone';

export type global_role = 'Admin' | 'Driver' | 'Passenger';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'CreateUser' parameters type */
export interface ICreateUserParams {
  authProvider: auth_provider;
  email?: string | null | void;
  emailVerified: boolean;
  firstName?: string | null | void;
  fullName: string;
  globalRole?: global_role | null | void;
  isActive: boolean;
  isBlocked: boolean;
  language: string;
  lastName?: string | null | void;
  metadata: Json;
  passwordHash?: string | null | void;
  phoneNumber?: string | null | void;
  phoneVerified: boolean;
  timezone: string;
}

/** 'CreateUser' return type */
export interface ICreateUserResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'CreateUser' query type */
export interface ICreateUserQuery {
  params: ICreateUserParams;
  result: ICreateUserResult;
}

const createUserIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"fullName":true,"email":true,"phoneNumber":true,"passwordHash":true,"authProvider":true,"globalRole":true,"emailVerified":true,"phoneVerified":true,"isActive":true,"isBlocked":true,"timezone":true,"language":true,"metadata":true},"params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":277,"b":286}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":293,"b":301}]},{"name":"fullName","required":true,"transform":{"type":"scalar"},"locs":[{"a":308,"b":317}]},{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":324,"b":329}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":336,"b":347}]},{"name":"passwordHash","required":false,"transform":{"type":"scalar"},"locs":[{"a":354,"b":366}]},{"name":"authProvider","required":true,"transform":{"type":"scalar"},"locs":[{"a":373,"b":386}]},{"name":"globalRole","required":false,"transform":{"type":"scalar"},"locs":[{"a":408,"b":418}]},{"name":"emailVerified","required":true,"transform":{"type":"scalar"},"locs":[{"a":438,"b":452}]},{"name":"phoneVerified","required":true,"transform":{"type":"scalar"},"locs":[{"a":459,"b":473}]},{"name":"isActive","required":true,"transform":{"type":"scalar"},"locs":[{"a":480,"b":489}]},{"name":"isBlocked","required":true,"transform":{"type":"scalar"},"locs":[{"a":496,"b":506}]},{"name":"timezone","required":true,"transform":{"type":"scalar"},"locs":[{"a":513,"b":522}]},{"name":"language","required":true,"transform":{"type":"scalar"},"locs":[{"a":529,"b":538}]},{"name":"metadata","required":true,"transform":{"type":"scalar"},"locs":[{"a":545,"b":554}]}],"statement":"INSERT INTO users (\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    timezone,\n    language,\n    metadata\n)\nVALUES (\n    :firstName,\n    :lastName,\n    :fullName!,\n    :email,\n    :phoneNumber,\n    :passwordHash,\n    :authProvider!::auth_provider,\n    :globalRole::global_role,\n    :emailVerified!,\n    :phoneVerified!,\n    :isActive!,\n    :isBlocked!,\n    :timezone!,\n    :language!,\n    :metadata!\n)\nRETURNING\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     timezone,
 *     language,
 *     metadata
 * )
 * VALUES (
 *     :firstName,
 *     :lastName,
 *     :fullName!,
 *     :email,
 *     :phoneNumber,
 *     :passwordHash,
 *     :authProvider!::auth_provider,
 *     :globalRole::global_role,
 *     :emailVerified!,
 *     :phoneVerified!,
 *     :isActive!,
 *     :isBlocked!,
 *     :timezone!,
 *     :language!,
 *     :metadata!
 * )
 * RETURNING
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * ```
 */
export const createUser = new PreparedQuery<ICreateUserParams,ICreateUserResult>(createUserIR);


/** 'GetUserById' parameters type */
export interface IGetUserByIdParams {
  id: string;
}

/** 'GetUserById' return type */
export interface IGetUserByIdResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'GetUserById' query type */
export interface IGetUserByIdQuery {
  params: IGetUserByIdParams;
  result: IGetUserByIdResult;
}

const getUserByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":455,"b":458}]}],"statement":"SELECT\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at\nFROM users\nWHERE id = :id!\n  AND deleted_at IS NULL\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * FROM users
 * WHERE id = :id!
 *   AND deleted_at IS NULL
 * LIMIT 1
 * ```
 */
export const getUserById = new PreparedQuery<IGetUserByIdParams,IGetUserByIdResult>(getUserByIdIR);


/** 'GetUserByEmail' parameters type */
export interface IGetUserByEmailParams {
  email: string;
}

/** 'GetUserByEmail' return type */
export interface IGetUserByEmailResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'GetUserByEmail' query type */
export interface IGetUserByEmailQuery {
  params: IGetUserByEmailParams;
  result: IGetUserByEmailResult;
}

const getUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":471,"b":477}]}],"statement":"SELECT\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at\nFROM users\nWHERE LOWER(email) = LOWER(:email!)\n  AND deleted_at IS NULL\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * FROM users
 * WHERE LOWER(email) = LOWER(:email!)
 *   AND deleted_at IS NULL
 * LIMIT 1
 * ```
 */
export const getUserByEmail = new PreparedQuery<IGetUserByEmailParams,IGetUserByEmailResult>(getUserByEmailIR);


/** 'GetUserByPhoneNumber' parameters type */
export interface IGetUserByPhoneNumberParams {
  phoneNumber: string;
}

/** 'GetUserByPhoneNumber' return type */
export interface IGetUserByPhoneNumberResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'GetUserByPhoneNumber' query type */
export interface IGetUserByPhoneNumberQuery {
  params: IGetUserByPhoneNumberParams;
  result: IGetUserByPhoneNumberResult;
}

const getUserByPhoneNumberIR: any = {"usedParamSet":{"phoneNumber":true},"params":[{"name":"phoneNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":465,"b":477}]}],"statement":"SELECT\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at\nFROM users\nWHERE phone_number = :phoneNumber!\n  AND deleted_at IS NULL\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * FROM users
 * WHERE phone_number = :phoneNumber!
 *   AND deleted_at IS NULL
 * LIMIT 1
 * ```
 */
export const getUserByPhoneNumber = new PreparedQuery<IGetUserByPhoneNumberParams,IGetUserByPhoneNumberResult>(getUserByPhoneNumberIR);


/** 'EmailExists' parameters type */
export interface IEmailExistsParams {
  email: string;
}

/** 'EmailExists' return type */
export interface IEmailExistsResult {
  exists: boolean;
}

/** 'EmailExists' query type */
export interface IEmailExistsQuery {
  params: IEmailExistsParams;
  result: IEmailExistsResult;
}

const emailExistsIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":75,"b":81}]}],"statement":"SELECT EXISTS (\n    SELECT 1\n    FROM users\n    WHERE LOWER(email) = LOWER(:email!)\n      AND deleted_at IS NULL\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *     SELECT 1
 *     FROM users
 *     WHERE LOWER(email) = LOWER(:email!)
 *       AND deleted_at IS NULL
 * ) AS "exists!"
 * ```
 */
export const emailExists = new PreparedQuery<IEmailExistsParams,IEmailExistsResult>(emailExistsIR);


/** 'PhoneExists' parameters type */
export interface IPhoneExistsParams {
  phoneNumber: string;
}

/** 'PhoneExists' return type */
export interface IPhoneExistsResult {
  exists: boolean;
}

/** 'PhoneExists' query type */
export interface IPhoneExistsQuery {
  params: IPhoneExistsParams;
  result: IPhoneExistsResult;
}

const phoneExistsIR: any = {"usedParamSet":{"phoneNumber":true},"params":[{"name":"phoneNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":81}]}],"statement":"SELECT EXISTS (\n    SELECT 1\n    FROM users\n    WHERE phone_number = :phoneNumber!\n      AND deleted_at IS NULL\n) AS \"exists!\""};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS (
 *     SELECT 1
 *     FROM users
 *     WHERE phone_number = :phoneNumber!
 *       AND deleted_at IS NULL
 * ) AS "exists!"
 * ```
 */
export const phoneExists = new PreparedQuery<IPhoneExistsParams,IPhoneExistsResult>(phoneExistsIR);


/** 'MarkEmailVerified' parameters type */
export interface IMarkEmailVerifiedParams {
  id: string;
}

/** 'MarkEmailVerified' return type */
export type IMarkEmailVerifiedResult = void;

/** 'MarkEmailVerified' query type */
export interface IMarkEmailVerifiedQuery {
  params: IMarkEmailVerifiedParams;
  result: IMarkEmailVerifiedResult;
}

const markEmailVerifiedIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":78,"b":81}]}],"statement":"UPDATE users\nSET\n    email_verified = TRUE,\n    updated_at = NOW()\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET
 *     email_verified = TRUE,
 *     updated_at = NOW()
 * WHERE id = :id!
 * ```
 */
export const markEmailVerified = new PreparedQuery<IMarkEmailVerifiedParams,IMarkEmailVerifiedResult>(markEmailVerifiedIR);


/** 'UpdateUserPasswordHash' parameters type */
export interface IUpdateUserPasswordHashParams {
  id: string;
  passwordHash: string;
}

/** 'UpdateUserPasswordHash' return type */
export type IUpdateUserPasswordHashResult = void;

/** 'UpdateUserPasswordHash' query type */
export interface IUpdateUserPasswordHashQuery {
  params: IUpdateUserPasswordHashParams;
  result: IUpdateUserPasswordHashResult;
}

const updateUserPasswordHashIR: any = {"usedParamSet":{"passwordHash":true,"id":true},"params":[{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":37,"b":50}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":123}]}],"statement":"UPDATE users\nSET\n    password_hash = :passwordHash!,\n    password_changed_at = NOW(),\n    updated_at = NOW()\nWHERE id = :id!\n  AND deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET
 *     password_hash = :passwordHash!,
 *     password_changed_at = NOW(),
 *     updated_at = NOW()
 * WHERE id = :id!
 *   AND deleted_at IS NULL
 * ```
 */
export const updateUserPasswordHash = new PreparedQuery<IUpdateUserPasswordHashParams,IUpdateUserPasswordHashResult>(updateUserPasswordHashIR);


/** 'UpdateUserLastLogin' parameters type */
export interface IUpdateUserLastLoginParams {
  id: string;
}

/** 'UpdateUserLastLogin' return type */
export type IUpdateUserLastLoginResult = void;

/** 'UpdateUserLastLogin' query type */
export interface IUpdateUserLastLoginQuery {
  params: IUpdateUserLastLoginParams;
  result: IUpdateUserLastLoginResult;
}

const updateUserLastLoginIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":78,"b":81}]}],"statement":"UPDATE users\nSET\n    last_login_at = NOW(),\n    updated_at = NOW()\nWHERE id = :id!\n  AND deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET
 *     last_login_at = NOW(),
 *     updated_at = NOW()
 * WHERE id = :id!
 *   AND deleted_at IS NULL
 * ```
 */
export const updateUserLastLogin = new PreparedQuery<IUpdateUserLastLoginParams,IUpdateUserLastLoginResult>(updateUserLastLoginIR);


/** 'UpdateUserProfile' parameters type */
export interface IUpdateUserProfileParams {
  dateOfBirth?: DateOrString | null | void;
  firstName?: string | null | void;
  gender?: string | null | void;
  id: string;
  language?: string | null | void;
  lastName?: string | null | void;
  phoneNumber?: string | null | void;
  timezone?: string | null | void;
}

/** 'UpdateUserProfile' return type */
export interface IUpdateUserProfileResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'UpdateUserProfile' query type */
export interface IUpdateUserProfileQuery {
  params: IUpdateUserProfileParams;
  result: IUpdateUserProfileResult;
}

const updateUserProfileIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"phoneNumber":true,"dateOfBirth":true,"gender":true,"timezone":true,"language":true,"id":true},"params":[{"name":"firstName","required":false,"transform":{"type":"scalar"},"locs":[{"a":43,"b":52},{"a":172,"b":181}]},{"name":"lastName","required":false,"transform":{"type":"scalar"},"locs":[{"a":93,"b":101},{"a":231,"b":239}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":293,"b":304}]},{"name":"dateOfBirth","required":false,"transform":{"type":"scalar"},"locs":[{"a":351,"b":362}]},{"name":"gender","required":false,"transform":{"type":"scalar"},"locs":[{"a":403,"b":409}]},{"name":"timezone","required":false,"transform":{"type":"scalar"},"locs":[{"a":445,"b":453}]},{"name":"language","required":false,"transform":{"type":"scalar"},"locs":[{"a":491,"b":499}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":547,"b":550}]}],"statement":"UPDATE users\nSET\n    first_name = COALESCE(:firstName, first_name),\n    last_name = COALESCE(:lastName, last_name),\n    full_name = TRIM(BOTH FROM CONCAT(\n        COALESCE(:firstName, first_name, ''),\n        ' ',\n        COALESCE(:lastName, last_name, '')\n    )),\n    phone_number = COALESCE(:phoneNumber, phone_number),\n    date_of_birth = COALESCE(:dateOfBirth, date_of_birth),\n    gender = COALESCE(:gender, gender),\n    timezone = COALESCE(:timezone, timezone),\n    language = COALESCE(:language, language),\n    updated_at = NOW()\nWHERE id = :id!\n  AND deleted_at IS NULL\nRETURNING\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET
 *     first_name = COALESCE(:firstName, first_name),
 *     last_name = COALESCE(:lastName, last_name),
 *     full_name = TRIM(BOTH FROM CONCAT(
 *         COALESCE(:firstName, first_name, ''),
 *         ' ',
 *         COALESCE(:lastName, last_name, '')
 *     )),
 *     phone_number = COALESCE(:phoneNumber, phone_number),
 *     date_of_birth = COALESCE(:dateOfBirth, date_of_birth),
 *     gender = COALESCE(:gender, gender),
 *     timezone = COALESCE(:timezone, timezone),
 *     language = COALESCE(:language, language),
 *     updated_at = NOW()
 * WHERE id = :id!
 *   AND deleted_at IS NULL
 * RETURNING
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * ```
 */
export const updateUserProfile = new PreparedQuery<IUpdateUserProfileParams,IUpdateUserProfileResult>(updateUserProfileIR);


/** 'UpdateUserRole' parameters type */
export interface IUpdateUserRoleParams {
  globalRole: global_role;
  id: string;
}

/** 'UpdateUserRole' return type */
export interface IUpdateUserRoleResult {
  auth_provider: auth_provider;
  avatar_url: string | null;
  blocked_reason: string | null;
  created_at: Date;
  date_of_birth: Date | null;
  deleted_at: Date | null;
  email: string | null;
  email_verified: boolean;
  first_name: string | null;
  full_name: string;
  gender: string | null;
  global_role: global_role | null;
  id: string;
  is_active: boolean;
  is_blocked: boolean;
  language: string;
  last_login_at: Date | null;
  last_name: string | null;
  metadata: Json;
  password_changed_at: Date | null;
  password_hash: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  provider_id: string | null;
  timezone: string;
  updated_at: Date;
}

/** 'UpdateUserRole' query type */
export interface IUpdateUserRoleQuery {
  params: IUpdateUserRoleParams;
  result: IUpdateUserRoleResult;
}

const updateUserRoleIR: any = {"usedParamSet":{"globalRole":true,"id":true},"params":[{"name":"globalRole","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":46}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":96,"b":99}]}],"statement":"UPDATE users\nSET\n    global_role = :globalRole!::global_role,\n    updated_at = NOW()\nWHERE id = :id!\n  AND deleted_at IS NULL\n  AND global_role IS NULL\nRETURNING\n    id,\n    first_name,\n    last_name,\n    full_name,\n    email,\n    phone_number,\n    password_hash,\n    auth_provider,\n    provider_id,\n    global_role,\n    email_verified,\n    phone_verified,\n    is_active,\n    is_blocked,\n    blocked_reason,\n    avatar_url,\n    date_of_birth,\n    gender,\n    timezone,\n    language,\n    last_login_at,\n    password_changed_at,\n    deleted_at,\n    metadata,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 * SET
 *     global_role = :globalRole!::global_role,
 *     updated_at = NOW()
 * WHERE id = :id!
 *   AND deleted_at IS NULL
 *   AND global_role IS NULL
 * RETURNING
 *     id,
 *     first_name,
 *     last_name,
 *     full_name,
 *     email,
 *     phone_number,
 *     password_hash,
 *     auth_provider,
 *     provider_id,
 *     global_role,
 *     email_verified,
 *     phone_verified,
 *     is_active,
 *     is_blocked,
 *     blocked_reason,
 *     avatar_url,
 *     date_of_birth,
 *     gender,
 *     timezone,
 *     language,
 *     last_login_at,
 *     password_changed_at,
 *     deleted_at,
 *     metadata,
 *     created_at,
 *     updated_at
 * ```
 */
export const updateUserRole = new PreparedQuery<IUpdateUserRoleParams,IUpdateUserRoleResult>(updateUserRoleIR);


