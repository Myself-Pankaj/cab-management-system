import { adminVehicleBlockers } from '@db/queries/admin/reporting.queries.js';
import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  countActiveVehiclesByProfileId,
  createVehicle,
  reviewVehicleGroup,
  markVehiclePhotosCorrected,
  getVehicleById,
  listVehiclesByProfileId,
  type ICreateVehicleParams,
} from '@db/queries/drivers/vehicles.queries.js';

@Injectable()
export class VehicleRepository extends BaseRepository {
  blockers(id: string, client: PoolClient) {
    return adminVehicleBlockers.run({ vehicleId: id }, client);
  }

  async updateDetails(
    id: string,
    params: ICreateVehicleParams,
    client: PoolClient,
  ) {
    const result = await client.query<
      NonNullable<Awaited<ReturnType<VehicleRepository['findById']>>>
    >(
      `UPDATE vehicles SET vehicle_number = $2, vehicle_type = $3, make = $4,
       model = $5, color = $6, manufacturing_year = $7 WHERE id = $1 RETURNING *`,
      [
        id,
        params.vehicleNumber,
        params.vehicleType,
        params.make,
        params.model,
        params.color,
        params.manufacturingYear,
      ],
    );
    return result.rows[0]!;
  }

  async reviewGroup(
    id: string,
    group: 'DETAILS' | 'PHOTOS',
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    reason: string | null,
    client: PoolClient,
    increment = false,
  ) {
    await reviewVehicleGroup.run(
      { id, reviewGroup: group, status, reason, increment },
      client,
    );
  }

  async photoCorrected(id: string, client: PoolClient) {
    await markVehiclePhotosCorrected.run({ id }, client);
  }

  async create(params: ICreateVehicleParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createVehicle.run(params, connection);
    if (!row) {
      throw new Error('Failed to create vehicle');
    }
    return row;
  }

  async listByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listVehiclesByProfileId.run({ driverProfileId }, connection);
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getVehicleById.run({ id }, connection);
    return row ?? null;
  }

  async countActiveByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await countActiveVehiclesByProfileId.run(
      { driverProfileId },
      connection,
    );
    return row?.count ?? 0;
  }
}
