import { Injectable } from '@nestjs/common';
import { PoolClient, QueryResultRow } from 'pg';
import { DatabaseService } from './database.service.js';
import { TransactionOptions, TransactionWork } from './database.types.js';

@Injectable()
export abstract class BaseRepository {
  constructor(protected readonly db: DatabaseService) {}

  protected get pool() {
    return this.db.getPool();
  }

  protected query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) {
    return this.db.query<T>(text, params);
  }

  protected withTransaction<T>(
    work: TransactionWork<T>,
    options?: TransactionOptions,
  ) {
    return this.db.withTransaction(work, options);
  }

  protected withReadOnlyTransaction<T>(work: TransactionWork<T>) {
    return this.db.withTransaction(work, { readOnly: true });
  }

  protected withSavepoint<T>(
    client: PoolClient,
    name: string,
    work: (client: PoolClient) => Promise<T>,
  ) {
    return this.db.withSavepoint(client, name, work);
  }
}
