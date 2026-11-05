import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  insertRideStatusHistory,
  listRideStatusHistory,
  type ride_status,
} from '@db/queries/rides/ride_status_history.queries.js';

@Injectable()
export class RideStatusHistoryRepository extends BaseRepository {
  async insert(
    rideId: string,
    oldStatus: ride_status | null,
    newStatus: ride_status,
    changedBy: string | null,
    note: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await insertRideStatusHistory.run(
      { rideId, oldStatus, newStatus, changedBy, note },
      connection,
    );
    if (!row) throw new Error('Failed to insert ride status history');
    return row;
  }

  async listByRideId(rideId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listRideStatusHistory.run({ rideId }, connection);
  }
}
