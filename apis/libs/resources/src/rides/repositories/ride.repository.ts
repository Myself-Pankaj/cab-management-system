import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  assignDriverToRide,
  cancelRide,
  createRide,
  getRideById,
  getRideByIdForBooker,
  listRidesAdmin,
  listRidesByBooker,
  updateRideStatus,
  type ICreateRideParams,
  type ride_status,
  type vehicle_category,
} from '@db/queries/rides/rides.queries.js';

@Injectable()
export class RideRepository extends BaseRepository {
  async create(params: ICreateRideParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createRide.run(params, connection);
    if (!row) throw new Error('Failed to create ride');
    return row;
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getRideById.run({ id }, connection);
    return row ?? null;
  }

  async findByIdForBooker(id: string, bookedByUserId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getRideByIdForBooker.run({ id, bookedByUserId }, connection);
    return row ?? null;
  }

  async listByBooker(
    bookedByUserId: string,
    status: ride_status | null,
    limit: number,
    offset: number,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    return listRidesByBooker.run({ bookedByUserId, status, limit, offset }, connection);
  }

  async listAdmin(
    status: ride_status | null,
    category: vehicle_category | null,
    limit: number,
    offset: number,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    return listRidesAdmin.run({ status, category, limit, offset }, connection);
  }

  async updateStatus(id: string, status: ride_status, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await updateRideStatus.run({ id, status }, connection);
    return row ?? null;
  }

  async assign(
    id: string,
    driverProfileId: string,
    vehicleId: string,
    assignedBy: string,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await assignDriverToRide.run(
      { id, driverProfileId, vehicleId, assignedBy },
      connection,
    );
    return row ?? null;
  }

  async cancel(
    id: string,
    cancelledBy: string,
    reason: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await cancelRide.run({ id, cancelledBy, reason }, connection);
    return row ?? null;
  }
}
