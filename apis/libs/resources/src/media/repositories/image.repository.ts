import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createImage,
  deleteImageById,
  getImageById,
  listImagesByOwner,
  countImagesByOwner,
  countImagesByOwnerAndType,
  type ICreateImageParams,
  type image_owner_type,
} from '@db/queries/media/images.queries.js';

@Injectable()
export class ImageRepository extends BaseRepository {
  async findByFileId(fileId: string, client: PoolClient) {
    const result = await client.query<
      NonNullable<Awaited<ReturnType<ImageRepository['findById']>>>
    >('SELECT * FROM images WHERE imagekit_file_id = $1', [fileId]);
    return result.rows[0] ?? null;
  }

  async create(params: ICreateImageParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createImage.run(params, connection);
    if (!row) {
      throw new Error('Failed to create image');
    }
    return row;
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getImageById.run({ id }, connection);
    return row ?? null;
  }

  async listByOwner(
    ownerType: image_owner_type,
    ownerId: string,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    return listImagesByOwner.run({ ownerType, ownerId }, connection);
  }

  async deleteById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await deleteImageById.run({ id }, connection);
    return row ?? null;
  }

  async countByOwner(
    ownerType: image_owner_type,
    ownerId: string,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await countImagesByOwner.run(
      { ownerType, ownerId },
      connection,
    );
    return row?.count ?? 0;
  }

  async countByOwnerAndType(
    ownerType: image_owner_type,
    ownerId: string,
    imageType: string,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await countImagesByOwnerAndType.run(
      { ownerType, ownerId, imageType },
      connection,
    );
    return row?.count ?? 0;
  }
}
