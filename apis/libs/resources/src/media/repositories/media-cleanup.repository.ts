import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  enqueueMediaCleanup,
  claimMediaCleanup,
  mediaFileReferenced,
  finishMediaCleanup,
  retryMediaCleanup,
} from '@db/queries/media/cleanup.queries.js';

@Injectable()
export class MediaCleanupRepository extends BaseRepository {
  async enqueue(fileId: string, client?: PoolClient): Promise<void> {
    if (!client)
      return this.withTransaction((connection) =>
        this.enqueue(fileId, connection),
      );
    const connection = client;
    await connection.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [fileId],
    );
    await enqueueMediaCleanup.run({ fileId }, connection);
  }
  claim() {
    return claimMediaCleanup.run(undefined, this.pool);
  }
  async referenced(fileId: string) {
    const [row] = await mediaFileReferenced.run({ fileId }, this.pool);
    return row?.referenced !== false;
  }
  finish(fileId: string) {
    return finishMediaCleanup.run({ fileId }, this.pool);
  }
  retry(fileId: string) {
    return retryMediaCleanup.run({ fileId }, this.pool);
  }
}
