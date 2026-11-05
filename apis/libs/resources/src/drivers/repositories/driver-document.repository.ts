import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createDriverDocument,
  deleteRejectedDriverDocumentByType,
  getDriverDocumentById,
  listDriverDocumentsByProfileId,
  updateDriverDocumentReview,
  type driver_document_type,
  type ICreateDriverDocumentParams,
  type review_status,
} from '@db/queries/drivers/driver_documents.queries.js';

@Injectable()
export class DriverDocumentRepository extends BaseRepository {
  async updateDetails(
    id: string,
    documentNumber: string | null,
    client: PoolClient,
  ) {
    const result = await client.query<
      NonNullable<Awaited<ReturnType<DriverDocumentRepository['findById']>>>
    >(
      `UPDATE driver_documents SET document_number = $2, status = 'PENDING',
       rejection_reason = NULL, reviewed_at = NULL WHERE id = $1 RETURNING *`,
      [id, documentNumber],
    );
    return result.rows[0]!;
  }

  async create(params: ICreateDriverDocumentParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createDriverDocument.run(params, connection);
    if (!row) {
      throw new Error('Failed to create driver document');
    }
    return row;
  }

  async listByProfileId(driverProfileId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listDriverDocumentsByProfileId.run({ driverProfileId }, connection);
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getDriverDocumentById.run({ id }, connection);
    return row ?? null;
  }

  async deleteRejectedByType(
    driverProfileId: string,
    documentType: driver_document_type,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    await deleteRejectedDriverDocumentByType.run(
      { driverProfileId, documentType },
      connection,
    );
  }

  async updateReview(
    id: string,
    status: review_status,
    rejectionReason: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await updateDriverDocumentReview.run(
      { id, status, rejectionReason },
      connection,
    );
    return row ?? null;
  }
}
