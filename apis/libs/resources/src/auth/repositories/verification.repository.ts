import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createVerification,
  deleteActiveVerification,
  deleteUsedOrExpiredVerifications,
  getActiveVerification,
  incrementVerificationAttempts,
  markVerificationUsed,
  type ICreateVerificationParams,
  type IGetActiveVerificationParams,
  type IGetActiveVerificationResult,
} from '@db/queries/users/user_verifications.queries.js';

export type VerificationRow = IGetActiveVerificationResult;

@Injectable()
export class VerificationRepository extends BaseRepository {
  async create(
    params: ICreateVerificationParams,
    client?: PoolClient,
  ): Promise<IGetActiveVerificationResult> {
    const connection = client ?? this.pool;
    const [row] = await createVerification.run(params, connection);
    if (!row) {
      throw new Error('Failed to create verification');
    }
    return row;
  }

  async findActive(
    params: IGetActiveVerificationParams,
    client?: PoolClient,
  ): Promise<IGetActiveVerificationResult | null> {
    const connection = client ?? this.pool;
    const [row] = await getActiveVerification.run(params, connection);
    return row ?? null;
  }

  async markUsed(id: string, client?: PoolClient): Promise<void> {
    const connection = client ?? this.pool;
    await markVerificationUsed.run({ id }, connection);
  }

  async incrementAttempts(id: string, client?: PoolClient): Promise<void> {
    const connection = client ?? this.pool;
    await incrementVerificationAttempts.run({ id }, connection);
  }

  async deleteActive(
    userId: string,
    purpose: IGetActiveVerificationParams['purpose'],
    target: string,
    client?: PoolClient,
  ): Promise<void> {
    const connection = client ?? this.pool;
    await deleteActiveVerification.run({ userId, purpose, target }, connection);
  }

  async cleanupExpired(): Promise<void> {
    await deleteUsedOrExpiredVerifications.run(undefined, this.pool);
  }
}
