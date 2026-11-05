import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  HealthRepository,
} from '@app/core';
import { BaseService } from '../common/base.service.js';

@Injectable()
export class HealthService extends BaseService {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  liveness() {
    return { status: 'ok' as const };
  }

  async readiness() {
    const result = await this.databaseService.checkReadiness();
    const pingOk = result.ready ? await this.healthRepository.ping() : 0;

    return {
      status: result.ready ? ('ready' as const) : ('not_ready' as const),
      db: result.db,
      pool: result.pool,
      ping: pingOk,
      saturated: result.saturated,
      shuttingDown: result.shuttingDown,
    };
  }
}
