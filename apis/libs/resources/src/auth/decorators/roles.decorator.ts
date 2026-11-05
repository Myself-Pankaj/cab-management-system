import { SetMetadata } from '@nestjs/common';
import type { global_role } from '@db/queries/users/users.queries.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: global_role[]) => SetMetadata(ROLES_KEY, roles);
