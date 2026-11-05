import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createVehicleDocument,
  getVehicleDocumentById,
  listVehicleDocumentsByVehicleId,
  updateVehicleDocumentReview,
  type ICreateVehicleDocumentParams,
  type review_status,
} from '@db/queries/drivers/vehicle_documents.queries.js';

@Injectable()
export class VehicleDocumentRepository extends BaseRepository {
  async updateDetails(
    id: string,
    documentNumber: string | null,
    expiryDate: Date | null,
    client: PoolClient,
  ) {
    const result = await client.query<
      NonNullable<Awaited<ReturnType<VehicleDocumentRepository['findById']>>>
    >(
      `UPDATE vehicle_documents SET document_number = $2, expiry_date = $3, status = 'PENDING',
       rejection_reason = NULL, reviewed_at = NULL WHERE id = $1 RETURNING *`,
      [id, documentNumber, expiryDate],
    );
    return result.rows[0]!;
  }

  async create(params: ICreateVehicleDocumentParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createVehicleDocument.run(params, connection);
    if (!row) {
      throw new Error('Failed to create vehicle document');
    }
    return row;
  }

  async listByVehicleId(vehicleId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listVehicleDocumentsByVehicleId.run({ vehicleId }, connection);
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getVehicleDocumentById.run({ id }, connection);
    return row ?? null;
  }

  async updateReview(
    id: string,
    status: review_status,
    rejectionReason: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await updateVehicleDocumentReview.run(
      { id, status, rejectionReason },
      connection,
    );
    return row ?? null;
  }
}
