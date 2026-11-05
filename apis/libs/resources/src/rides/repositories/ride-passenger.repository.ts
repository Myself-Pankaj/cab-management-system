import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createRidePassenger,
  listPassengersByRideId,
} from '@db/queries/rides/ride_passengers.queries.js';

@Injectable()
export class RidePassengerRepository extends BaseRepository {
  async create(
    rideId: string,
    name: string,
    phone: string,
    isPrimary: boolean,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await createRidePassenger.run(
      { rideId, name, phone, isPrimary },
      connection,
    );
    if (!row) throw new Error('Failed to create ride passenger');
    return row;
  }

  async listByRideId(rideId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listPassengersByRideId.run({ rideId }, connection);
  }
}
