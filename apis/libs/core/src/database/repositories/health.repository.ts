import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base.repository.js';
import { DatabaseService } from '../database.service.js';
import { pingDb } from '@db/queries/health/ping.queries.js';

@Injectable()
export class HealthRepository extends BaseRepository {
  constructor(db: DatabaseService) {
    super(db);
  }

  async ping(): Promise<number> {
    const [row] = await pingDb.run(undefined, this.pool);
    return row?.ok ?? 0;
  }
}
