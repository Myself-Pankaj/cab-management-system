import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  upsertDriverBankAccount,
  getDriverBankAccountByProfileId,
  type IUpsertDriverBankAccountParams,
} from '@db/queries/drivers/driver_bank_accounts.queries.js';

@Injectable()
export class DriverBankAccountRepository extends BaseRepository {
  async upsert(params: IUpsertDriverBankAccountParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await upsertDriverBankAccount.run(params, connection);
    if (!row) {
      throw new Error('Failed to upsert bank account');
    }
    return row;
  }

  async findByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getDriverBankAccountByProfileId.run({ driverProfileId }, connection);
    return row ?? null;
  }
}
