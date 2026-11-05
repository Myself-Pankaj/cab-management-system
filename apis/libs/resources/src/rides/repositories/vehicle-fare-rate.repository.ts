import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  getFareRateByCategory,
  listActiveFareRates,
  type IGetFareRateByCategoryResult,
  type vehicle_category,
} from '@db/queries/rides/vehicle_fare_rates.queries.js';

@Injectable()
export class VehicleFareRateRepository extends BaseRepository {
  async listActive(client?: PoolClient) {
    const connection = client ?? this.pool;
    return listActiveFareRates.run(undefined, connection);
  }

  async findByCategory(
    category: vehicle_category,
    client?: PoolClient,
  ): Promise<IGetFareRateByCategoryResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getFareRateByCategory.run({ category }, connection);
    return row ?? null;
  }
}
