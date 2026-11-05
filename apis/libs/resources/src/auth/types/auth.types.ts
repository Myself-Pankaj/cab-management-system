import type {
  global_role,
  IGetUserByIdResult,
} from '@db/queries/users/users.queries.js';

export type GlobalRole = global_role;
export type UserRow = IGetUserByIdResult;

export type TokenType = 'access' | 'refresh';

export interface JwtClaims {
  user_id: string;
  email: string;
  phone_number: string;
  role: GlobalRole | null;
  email_verified: boolean;
  phone_verified: boolean;
  token_type: TokenType;
  sub: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
}

export interface UserResponse {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  auth_provider: UserRow['auth_provider'];
  global_role: GlobalRole | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  is_blocked: boolean;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  timezone: string;
  language: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name,
    email: row.email,
    phone_number: row.phone_number,
    auth_provider: row.auth_provider,
    global_role: row.global_role,
    email_verified: row.email_verified,
    phone_verified: row.phone_verified,
    is_active: row.is_active,
    is_blocked: row.is_blocked,
    avatar_url: row.avatar_url,
    date_of_birth: row.date_of_birth?.toISOString().slice(0, 10) ?? null,
    gender: row.gender,
    timezone: row.timezone,
    language: row.language,
    last_login_at: row.last_login_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export interface AuthSessionData {
  user: UserResponse;
  access_token: string;
  access_token_expires_at: string;
  refresh_token?: string;
  refresh_token_expires_at?: string;
}

export interface RefreshSessionData {
  message: string;
  access_token: string;
  access_token_expires_at: string;
}
