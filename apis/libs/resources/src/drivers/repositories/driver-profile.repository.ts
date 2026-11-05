import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createDriverProfile,
  getDriverProfileById,
  getDriverProfileByUserId,
  listPendingDriverProfiles,
  updateDriverProfileStatus,
  type driver_profile_status,
  type ICreateDriverProfileParams,
  type IGetDriverProfileByIdResult,
} from '@db/queries/drivers/driver_profiles.queries.js';

@Injectable()
export class DriverProfileRepository extends BaseRepository {
  async lockById(
    id: string,
    client: PoolClient,
  ): Promise<IGetDriverProfileByIdResult | null> {
    const result = await client.query<IGetDriverProfileByIdResult>(
      'SELECT * FROM driver_profiles WHERE id = $1 FOR UPDATE',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async create(
    params: ICreateDriverProfileParams,
    client?: PoolClient,
  ): Promise<IGetDriverProfileByIdResult> {
    const connection = client ?? this.pool;
    const [row] = await createDriverProfile.run(params, connection);
    if (!row) {
      throw new Error('Failed to create driver profile');
    }
    return row;
  }

  async findByUserId(
    userId: string,
    client?: PoolClient,
  ): Promise<IGetDriverProfileByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getDriverProfileByUserId.run({ userId }, connection);
    return row ?? null;
  }

  async findById(
    id: string,
    client?: PoolClient,
  ): Promise<IGetDriverProfileByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getDriverProfileById.run({ id }, connection);
    return row ?? null;
  }

  async listPending(client?: PoolClient) {
    const connection = client ?? this.pool;
    return listPendingDriverProfiles.run(undefined, connection);
  }

  async updateStatus(
    id: string,
    status: driver_profile_status,
    client?: PoolClient,
  ): Promise<IGetDriverProfileByIdResult | null> {
    const connection = client ?? this.pool;
    const [row] = await updateDriverProfileStatus.run(
      { id, status },
      connection,
    );
    return row ?? null;
  }
}
