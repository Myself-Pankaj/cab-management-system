import type {
  driver_profile_status,
  IGetDriverProfileByIdResult,
} from '@db/queries/drivers/driver_profiles.queries.js';

export type DriverProfileStatus = driver_profile_status;
export type DriverProfileRow = IGetDriverProfileByIdResult;

export interface DriverProfileResponse {
  id: string;
  user_id: string;
  status: DriverProfileStatus;
  created_at: string;
  updated_at: string;
}

export function toDriverProfileResponse(row: DriverProfileRow): DriverProfileResponse {
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export const EDITABLE_DRIVER_PROFILE_STATUSES: DriverProfileStatus[] = [
  'DRAFT',
  'REJECTED',
];
