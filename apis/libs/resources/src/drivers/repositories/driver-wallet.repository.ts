import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createDriverWallet,
  getDriverWalletByProfileId,
} from '@db/queries/drivers/driver_wallets.queries.js';

@Injectable()
export class DriverWalletRepository extends BaseRepository {
  async create(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createDriverWallet.run({ driverProfileId }, connection);
    if (!row) {
      throw new Error('Failed to create driver wallet');
    }
    return row;
  }

  async findByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getDriverWalletByProfileId.run({ driverProfileId }, connection);
    return row ?? null;
  }
}
