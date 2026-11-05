import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  getRideCancellationByRideId,
  insertRideCancellation,
} from '@db/queries/rides/ride_cancellations.queries.js';

@Injectable()
export class RideCancellationRepository extends BaseRepository {
  async create(
    rideId: string,
    cancelledBy: string,
    reason: string | null,
    refundRequired: boolean,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await insertRideCancellation.run(
      { rideId, cancelledBy, reason, refundRequired },
      connection,
    );
    if (!row) throw new Error('Failed to insert ride cancellation');
    return row;
  }

  async findByRideId(rideId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getRideCancellationByRideId.run({ rideId }, connection);
    return row ?? null;
  }
}
