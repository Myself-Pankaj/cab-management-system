import { PoolClient } from 'pg';

export type IsolationLevel =
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  readOnly?: boolean;
  deferrable?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  name?: string;
}

export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  max: number;
}

export interface HealthCheckResult {
  ok: true;
  latencyMs: number;
}

export interface ReadinessResult {
  ready: boolean;
  db: HealthCheckResult | { ok: false; error: string };
  pool: PoolStats;
  saturated: boolean;
  shuttingDown: boolean;
}

export type TransactionWork<T> = (client: PoolClient) => Promise<T>;

/** Postgres SQLSTATE codes that are safe to retry inside a transaction. */
export const TRANSIENT_TX_ERROR_CODES = new Set(['40001', '40P01']);
