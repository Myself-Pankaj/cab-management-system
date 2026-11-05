import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createDriverVerification,
  getLatestDriverVerificationByProfileId,
  updateDriverVerificationReview,
  type review_status,
} from '@db/queries/drivers/driver_verifications.queries.js';

@Injectable()
export class DriverVerificationRepository extends BaseRepository {
  async create(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createDriverVerification.run({ driverProfileId }, connection);
    if (!row) {
      throw new Error('Failed to create driver verification');
    }
    return row;
  }

  async findLatestByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getLatestDriverVerificationByProfileId.run(
      { driverProfileId },
      connection,
    );
    return row ?? null;
  }

  async updateReview(
    id: string,
    status: review_status,
    reviewedBy: string,
    rejectionReason: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await updateDriverVerificationReview.run(
      { id, status, reviewedBy, rejectionReason },
      connection,
    );
    return row ?? null;
  }
}
