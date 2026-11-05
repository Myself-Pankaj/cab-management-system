import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { AppConfigService } from '../config/config.service.js';
import { DatabaseConfig } from '../config/config.interface.js';
import { AppLogger } from '../logger/logger.service.js';
import {
  HealthCheckResult,
  PoolStats,
  ReadinessResult,
  TransactionOptions,
  TransactionWork,
  TRANSIENT_TX_ERROR_CODES,
} from './database.types.js';

interface QueryMetrics {
  text: string;
  durationMs: number;
  rowCount: number;
}

interface PostgresErrorLike {
  code?: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: AppLogger;
  private readonly pool: Pool;
  private readonly config: DatabaseConfig;
  private isShuttingDown = false;
  private inFlightOperations = 0;

  constructor(
    appConfig: AppConfigService,
    appLogger: AppLogger,
  ) {
    const config = appConfig.database;
    this.config = config;
    this.logger = appLogger.forContext('DatabaseService');

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,

      max: config.max,
      min: config.min,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
      statement_timeout: config.statementTimeoutMillis,
      maxLifetimeSeconds: config.maxLifetimeSeconds,
      keepAlive: config.keepAlive,
      keepAliveInitialDelayMillis: config.keepAliveInitialDelayMillis,
      allowExitOnIdle: config.allowExitOnIdle,
      ...(config.maxUses !== undefined ? { maxUses: config.maxUses } : {}),

      ssl: config.ssl,
      application_name: config.serviceName,
    });

    this.pool.on('error', (err) => {
      this.logger.error(
        `Unexpected error on idle Postgres client: ${err.message}`,
        err,
      );
    });

    this.pool.on('connect', () =>
      this.logger.debug('New client connected to pool'),
    );
    this.pool.on('remove', () =>
      this.logger.debug('Client removed from pool'),
    );
  }

  async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
    this.logger.log(
      `Postgres pool ready (max=${this.config.max}, min=${this.config.min}, ` +
        `idleTimeout=${this.config.idleTimeoutMillis}ms, ` +
        `maxLifetime=${this.config.maxLifetimeSeconds}s)`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    this.logger.log('Draining Postgres pool...');

    const deadline = Date.now() + this.config.drainTimeoutMs;
    while (this.inFlightOperations > 0 && Date.now() < deadline) {
      await this.sleep(100);
    }

    if (this.inFlightOperations > 0) {
      this.logger.warn(
        `Drain timeout reached with ${this.inFlightOperations} in-flight operation(s); closing pool`,
      );
    }

    await this.pool.end();
    this.logger.log('Postgres pool closed');
  }

  get shuttingDown(): boolean {
    return this.isShuttingDown;
  }

  /**
   * Raw pool handle for pgtyped-generated query functions.
   * Never log connection strings or passwords.
   */
  getPool(): Pool {
    this.assertAcceptingWork();
    return this.pool;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    this.assertAcceptingWork();
    const start = process.hrtime.bigint();
    await this.pool.query('SELECT 1');
    return { ok: true, latencyMs: this.elapsedMs(start) };
  }

  getPoolStats(): PoolStats {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      max: this.config.max,
    };
  }

  isPoolSaturated(): boolean {
    const stats = this.getPoolStats();
    if (stats.max <= 0) return false;
    return stats.waitingCount / stats.max > this.config.poolSaturationThreshold;
  }

  async checkReadiness(): Promise<ReadinessResult> {
    const pool = this.getPoolStats();
    const saturated = this.isPoolSaturated();
    const shuttingDown = this.isShuttingDown;

    if (shuttingDown || saturated) {
      return {
        ready: false,
        db: {
          ok: false,
          error: shuttingDown ? 'shutting_down' : 'pool_saturated',
        },
        pool,
        saturated,
        shuttingDown,
      };
    }

    try {
      const db = await this.healthCheck();
      return { ready: true, db, pool, saturated: false, shuttingDown: false };
    } catch (err) {
      return {
        ready: false,
        db: { ok: false, error: (err as Error).message },
        pool,
        saturated,
        shuttingDown,
      };
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    this.assertAcceptingWork();
    this.inFlightOperations++;
    const start = process.hrtime.bigint();
    try {
      const result = await this.pool.query<T>(text, params as unknown[]);
      this.logQuery({
        text,
        durationMs: this.elapsedMs(start),
        rowCount: result.rowCount ?? 0,
      });
      return result;
    } catch (err) {
      this.logger.error(
        `Query failed after ${this.elapsedMs(start).toFixed(1)}ms: ${text}`,
        err as Error,
      );
      throw err;
    } finally {
      this.inFlightOperations--;
    }
  }

  async withTransaction<T>(
    work: TransactionWork<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    this.assertAcceptingWork();

    const maxRetries = options.maxRetries ?? this.config.txMaxRetries;
    const retryDelayMs = options.retryDelayMs ?? 100;
    const txName = options.name ?? 'anonymous';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.runTransaction(work, options);
      } catch (err) {
        const code = (err as PostgresErrorLike).code;
        const isTransient =
          code !== undefined && TRANSIENT_TX_ERROR_CODES.has(code);

        if (!isTransient || attempt >= maxRetries) {
          throw err;
        }

        const delay = retryDelayMs * Math.pow(2, attempt);
        this.logger.warn(
          `Transaction "${txName}" retry ${attempt + 1}/${maxRetries} ` +
            `after ${code} in ${delay}ms`,
        );
        await this.sleep(delay);
      }
    }

    throw new Error(`Transaction "${txName}" failed after retries`);
  }

  async withSavepoint<T>(
    client: PoolClient,
    name: string,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const savepoint = `sp_${name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    await client.query(`SAVEPOINT ${savepoint}`);
    try {
      const result = await work(client);
      await client.query(`RELEASE SAVEPOINT ${savepoint}`);
      return result;
    } catch (err) {
      await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      throw err;
    }
  }

  private async runTransaction<T>(
    work: TransactionWork<T>,
    options: TransactionOptions,
  ): Promise<T> {
    this.inFlightOperations++;
    const client = await this.pool.connect();
    const start = process.hrtime.bigint();
    const txName = options.name ?? 'anonymous';

    try {
      await client.query(this.buildBeginStatement(options));
      const result = await work(client);
      await client.query('COMMIT');
      this.logger.debug(
        `Transaction "${txName}" committed in ${this.elapsedMs(start).toFixed(1)}ms`,
      );
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.warn(
        `Transaction "${txName}" rolled back after ${this.elapsedMs(start).toFixed(1)}ms: ${(err as Error).message}`,
      );
      throw err;
    } finally {
      client.release();
      this.inFlightOperations--;
    }
  }

  private buildBeginStatement(options: TransactionOptions): string {
    const parts = ['BEGIN'];
    if (options.isolationLevel) {
      parts.push('ISOLATION LEVEL', options.isolationLevel);
    }
    if (options.readOnly) {
      parts.push('READ ONLY');
    }
    if (options.deferrable) {
      parts.push('DEFERRABLE');
    }
    return parts.join(' ');
  }

  private async connectWithRetry(): Promise<void> {
    const { startupRetries, startupRetryDelayMs } = this.config;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= startupRetries; attempt++) {
      try {
        await this.healthCheck();
        if (attempt > 0) {
          this.logger.log(`Postgres connected on retry attempt ${attempt}`);
        }
        return;
      } catch (err) {
        lastError = err as Error;
        if (attempt < startupRetries) {
          this.logger.warn(
            `Postgres connection attempt ${attempt + 1} failed: ${lastError.message}. ` +
              `Retrying in ${startupRetryDelayMs}ms...`,
          );
          await this.sleep(startupRetryDelayMs);
        }
      }
    }

    throw new Error(
      `Failed to connect to Postgres after ${startupRetries + 1} attempt(s): ${lastError?.message}`,
    );
  }

  private assertAcceptingWork(): void {
    if (this.isShuttingDown) {
      throw new Error('Database pool is shutting down; rejecting new work');
    }
  }

  private elapsedMs(startNs: bigint): number {
    return Number(process.hrtime.bigint() - startNs) / 1e6;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logQuery(metrics: QueryMetrics): void {
    const { text, durationMs, rowCount } = metrics;
    const message = `query="${this.truncate(text)}" duration=${durationMs.toFixed(1)}ms rows=${rowCount}`;

    if (durationMs >= this.config.slowQueryMs) {
      this.logger.warn(`SLOW QUERY ${message}`);
    } else {
      this.logger.debug(message);
    }
  }

  private truncate(text: string, max = 120): string {
    return text.length > max ? `${text.slice(0, max)}...` : text;
  }
}
