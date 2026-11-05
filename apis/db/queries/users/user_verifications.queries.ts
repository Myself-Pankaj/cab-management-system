/** Types generated for queries found in "db/queries/users/user_verifications.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type verification_purpose = 'email_verification' | 'login_otp' | 'password_reset' | 'phone_verification';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'CreateVerification' parameters type */
export interface ICreateVerificationParams {
  attempts: number;
  expiresAt: DateOrString;
  isUsed: boolean;
  maxAttempts: number;
  otpHash: string;
  purpose: verification_purpose;
  target: string;
  userId: string;
}

/** 'CreateVerification' return type */
export interface ICreateVerificationResult {
  attempts: number;
  created_at: Date;
  expires_at: Date;
  id: string;
  is_used: boolean;
  max_attempts: number;
  otp_hash: string;
  purpose: verification_purpose;
  target: string;
  used_at: Date | null;
  user_id: string;
}

/** 'CreateVerification' query type */
export interface ICreateVerificationQuery {
  params: ICreateVerificationParams;
  result: ICreateVerificationResult;
}

const createVerificationIR: any = {"usedParamSet":{"userId":true,"purpose":true,"target":true,"otpHash":true,"attempts":true,"maxAttempts":true,"isUsed":true,"expiresAt":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":160,"b":167}]},{"name":"purpose","required":true,"transform":{"type":"scalar"},"locs":[{"a":174,"b":182}]},{"name":"target","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":218}]},{"name":"otpHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":225,"b":233}]},{"name":"attempts","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":249}]},{"name":"maxAttempts","required":true,"transform":{"type":"scalar"},"locs":[{"a":256,"b":268}]},{"name":"isUsed","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":282}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":289,"b":299}]}],"statement":"INSERT INTO user_verifications (\n    user_id,\n    purpose,\n    target,\n    otp_hash,\n    attempts,\n    max_attempts,\n    is_used,\n    expires_at\n)\nVALUES (\n    :userId!,\n    :purpose!::verification_purpose,\n    :target!,\n    :otpHash!,\n    :attempts!,\n    :maxAttempts!,\n    :isUsed!,\n    :expiresAt!\n)\nRETURNING\n    id,\n    user_id,\n    purpose,\n    target,\n    otp_hash,\n    attempts,\n    max_attempts,\n    is_used,\n    expires_at,\n    used_at,\n    created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_verifications (
 *     user_id,
 *     purpose,
 *     target,
 *     otp_hash,
 *     attempts,
 *     max_attempts,
 *     is_used,
 *     expires_at
 * )
 * VALUES (
 *     :userId!,
 *     :purpose!::verification_purpose,
 *     :target!,
 *     :otpHash!,
 *     :attempts!,
 *     :maxAttempts!,
 *     :isUsed!,
 *     :expiresAt!
 * )
 * RETURNING
 *     id,
 *     user_id,
 *     purpose,
 *     target,
 *     otp_hash,
 *     attempts,
 *     max_attempts,
 *     is_used,
 *     expires_at,
 *     used_at,
 *     created_at
 * ```
 */
export const createVerification = new PreparedQuery<ICreateVerificationParams,ICreateVerificationResult>(createVerificationIR);


/** 'GetActiveVerification' parameters type */
export interface IGetActiveVerificationParams {
  purpose: verification_purpose;
  target: string;
  userId: string;
}

/** 'GetActiveVerification' return type */
export interface IGetActiveVerificationResult {
  attempts: number;
  created_at: Date;
  expires_at: Date;
  id: string;
  is_used: boolean;
  max_attempts: number;
  otp_hash: string;
  purpose: verification_purpose;
  target: string;
  used_at: Date | null;
  user_id: string;
}

/** 'GetActiveVerification' query type */
export interface IGetActiveVerificationQuery {
  params: IGetActiveVerificationParams;
  result: IGetActiveVerificationResult;
}

const getActiveVerificationIR: any = {"usedParamSet":{"userId":true,"purpose":true,"target":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":196,"b":203}]},{"name":"purpose","required":true,"transform":{"type":"scalar"},"locs":[{"a":221,"b":229}]},{"name":"target","required":true,"transform":{"type":"scalar"},"locs":[{"a":268,"b":275}]}],"statement":"SELECT\n    id,\n    user_id,\n    purpose,\n    target,\n    otp_hash,\n    attempts,\n    max_attempts,\n    is_used,\n    expires_at,\n    used_at,\n    created_at\nFROM user_verifications\nWHERE user_id = :userId!\n  AND purpose = :purpose!::verification_purpose\n  AND target = :target!\n  AND is_used = false\n  AND expires_at > NOW()\nORDER BY created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     purpose,
 *     target,
 *     otp_hash,
 *     attempts,
 *     max_attempts,
 *     is_used,
 *     expires_at,
 *     used_at,
 *     created_at
 * FROM user_verifications
 * WHERE user_id = :userId!
 *   AND purpose = :purpose!::verification_purpose
 *   AND target = :target!
 *   AND is_used = false
 *   AND expires_at > NOW()
 * ORDER BY created_at DESC
 * LIMIT 1
 * ```
 */
export const getActiveVerification = new PreparedQuery<IGetActiveVerificationParams,IGetActiveVerificationResult>(getActiveVerificationIR);


/** 'MarkVerificationUsed' parameters type */
export interface IMarkVerificationUsedParams {
  id: NumberOrString;
}

/** 'MarkVerificationUsed' return type */
export type IMarkVerificationUsedResult = void;

/** 'MarkVerificationUsed' query type */
export interface IMarkVerificationUsedQuery {
  params: IMarkVerificationUsedParams;
  result: IMarkVerificationUsedResult;
}

const markVerificationUsedIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":80}]}],"statement":"UPDATE user_verifications\nSET is_used = true,\n    used_at = NOW()\nWHERE id = :id!\n  AND is_used = false"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE user_verifications
 * SET is_used = true,
 *     used_at = NOW()
 * WHERE id = :id!
 *   AND is_used = false
 * ```
 */
export const markVerificationUsed = new PreparedQuery<IMarkVerificationUsedParams,IMarkVerificationUsedResult>(markVerificationUsedIR);


/** 'IncrementVerificationAttempts' parameters type */
export interface IIncrementVerificationAttemptsParams {
  id: NumberOrString;
}

/** 'IncrementVerificationAttempts' return type */
export type IIncrementVerificationAttemptsResult = void;

/** 'IncrementVerificationAttempts' query type */
export interface IIncrementVerificationAttemptsQuery {
  params: IIncrementVerificationAttemptsParams;
  result: IIncrementVerificationAttemptsResult;
}

const incrementVerificationAttemptsIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":68}]}],"statement":"UPDATE user_verifications\nSET attempts = attempts + 1\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE user_verifications
 * SET attempts = attempts + 1
 * WHERE id = :id!
 * ```
 */
export const incrementVerificationAttempts = new PreparedQuery<IIncrementVerificationAttemptsParams,IIncrementVerificationAttemptsResult>(incrementVerificationAttemptsIR);


/** 'DeleteActiveVerification' parameters type */
export interface IDeleteActiveVerificationParams {
  purpose: verification_purpose;
  target: string;
  userId: string;
}

/** 'DeleteActiveVerification' return type */
export type IDeleteActiveVerificationResult = void;

/** 'DeleteActiveVerification' query type */
export interface IDeleteActiveVerificationQuery {
  params: IDeleteActiveVerificationParams;
  result: IDeleteActiveVerificationResult;
}

const deleteActiveVerificationIR: any = {"usedParamSet":{"userId":true,"purpose":true,"target":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":89}]},{"name":"purpose","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":115}]},{"name":"target","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":161}]}],"statement":"UPDATE user_verifications\nSET is_used = true,\n    used_at = NOW()\nWHERE user_id = :userId!\n  AND purpose = :purpose!::verification_purpose\n  AND target = :target!\n  AND is_used = false"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE user_verifications
 * SET is_used = true,
 *     used_at = NOW()
 * WHERE user_id = :userId!
 *   AND purpose = :purpose!::verification_purpose
 *   AND target = :target!
 *   AND is_used = false
 * ```
 */
export const deleteActiveVerification = new PreparedQuery<IDeleteActiveVerificationParams,IDeleteActiveVerificationResult>(deleteActiveVerificationIR);


/** 'DeleteUsedOrExpiredVerifications' parameters type */
export type IDeleteUsedOrExpiredVerificationsParams = void;

/** 'DeleteUsedOrExpiredVerifications' return type */
export type IDeleteUsedOrExpiredVerificationsResult = void;

/** 'DeleteUsedOrExpiredVerifications' query type */
export interface IDeleteUsedOrExpiredVerificationsQuery {
  params: IDeleteUsedOrExpiredVerificationsParams;
  result: IDeleteUsedOrExpiredVerificationsResult;
}

const deleteUsedOrExpiredVerificationsIR: any = {"usedParamSet":{},"params":[],"statement":"DELETE FROM user_verifications\nWHERE is_used = TRUE\n   OR expires_at < NOW()"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM user_verifications
 * WHERE is_used = TRUE
 *    OR expires_at < NOW()
 * ```
 */
export const deleteUsedOrExpiredVerifications = new PreparedQuery<IDeleteUsedOrExpiredVerificationsParams,IDeleteUsedOrExpiredVerificationsResult>(deleteUsedOrExpiredVerificationsIR);


