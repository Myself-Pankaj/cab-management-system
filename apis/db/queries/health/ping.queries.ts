/** Types generated for queries found in "db/queries/health/ping.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'PingDb' parameters type */
export type IPingDbParams = void;

/** 'PingDb' return type */
export interface IPingDbResult {
  ok: number | null;
}

/** 'PingDb' query type */
export interface IPingDbQuery {
  params: IPingDbParams;
  result: IPingDbResult;
}

const pingDbIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT 1 AS ok"};

/**
 * Query generated from SQL:
 * ```
 * SELECT 1 AS ok
 * ```
 */
export const pingDb = new PreparedQuery<IPingDbParams,IPingDbResult>(pingDbIR);


