/** Types generated for queries found in "db/queries/media/cleanup.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'EnqueueMediaCleanup' parameters type */
export interface IEnqueueMediaCleanupParams {
  fileId: string;
}

/** 'EnqueueMediaCleanup' return type */
export type IEnqueueMediaCleanupResult = void;

/** 'EnqueueMediaCleanup' query type */
export interface IEnqueueMediaCleanupQuery {
  params: IEnqueueMediaCleanupParams;
  result: IEnqueueMediaCleanupResult;
}

const enqueueMediaCleanupIR: any = {"usedParamSet":{"fileId":true},"params":[{"name":"fileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":54}]}],"statement":"INSERT INTO media_cleanup_jobs(file_id) VALUES(:fileId!) ON CONFLICT(file_id) DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO media_cleanup_jobs(file_id) VALUES(:fileId!) ON CONFLICT(file_id) DO NOTHING
 * ```
 */
export const enqueueMediaCleanup = new PreparedQuery<IEnqueueMediaCleanupParams,IEnqueueMediaCleanupResult>(enqueueMediaCleanupIR);


/** 'ClaimMediaCleanup' parameters type */
export type IClaimMediaCleanupParams = void;

/** 'ClaimMediaCleanup' return type */
export interface IClaimMediaCleanupResult {
  attempts: number;
  file_id: string;
}

/** 'ClaimMediaCleanup' query type */
export interface IClaimMediaCleanupQuery {
  params: IClaimMediaCleanupParams;
  result: IClaimMediaCleanupResult;
}

const claimMediaCleanupIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE media_cleanup_jobs SET leased_until=NOW()+INTERVAL '5 minutes'\nWHERE file_id IN (\n SELECT file_id FROM media_cleanup_jobs WHERE available_at<=NOW()\n AND (leased_until IS NULL OR leased_until<NOW())\n ORDER BY available_at LIMIT 20 FOR UPDATE SKIP LOCKED\n) RETURNING file_id, attempts"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE media_cleanup_jobs SET leased_until=NOW()+INTERVAL '5 minutes'
 * WHERE file_id IN (
 *  SELECT file_id FROM media_cleanup_jobs WHERE available_at<=NOW()
 *  AND (leased_until IS NULL OR leased_until<NOW())
 *  ORDER BY available_at LIMIT 20 FOR UPDATE SKIP LOCKED
 * ) RETURNING file_id, attempts
 * ```
 */
export const claimMediaCleanup = new PreparedQuery<IClaimMediaCleanupParams,IClaimMediaCleanupResult>(claimMediaCleanupIR);


/** 'MediaFileReferenced' parameters type */
export interface IMediaFileReferencedParams {
  fileId: string;
}

/** 'MediaFileReferenced' return type */
export interface IMediaFileReferencedResult {
  referenced: boolean | null;
}

/** 'MediaFileReferenced' query type */
export interface IMediaFileReferencedQuery {
  params: IMediaFileReferencedParams;
  result: IMediaFileReferencedResult;
}

const mediaFileReferencedIR: any = {"usedParamSet":{"fileId":true},"params":[{"name":"fileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":65}]}],"statement":"SELECT EXISTS(SELECT 1 FROM images WHERE imagekit_file_id=:fileId!) AS referenced"};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS(SELECT 1 FROM images WHERE imagekit_file_id=:fileId!) AS referenced
 * ```
 */
export const mediaFileReferenced = new PreparedQuery<IMediaFileReferencedParams,IMediaFileReferencedResult>(mediaFileReferencedIR);


/** 'FinishMediaCleanup' parameters type */
export interface IFinishMediaCleanupParams {
  fileId: string;
}

/** 'FinishMediaCleanup' return type */
export type IFinishMediaCleanupResult = void;

/** 'FinishMediaCleanup' query type */
export interface IFinishMediaCleanupQuery {
  params: IFinishMediaCleanupParams;
  result: IFinishMediaCleanupResult;
}

const finishMediaCleanupIR: any = {"usedParamSet":{"fileId":true},"params":[{"name":"fileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":45,"b":52}]}],"statement":"DELETE FROM media_cleanup_jobs WHERE file_id=:fileId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM media_cleanup_jobs WHERE file_id=:fileId!
 * ```
 */
export const finishMediaCleanup = new PreparedQuery<IFinishMediaCleanupParams,IFinishMediaCleanupResult>(finishMediaCleanupIR);


/** 'RetryMediaCleanup' parameters type */
export interface IRetryMediaCleanupParams {
  fileId: string;
}

/** 'RetryMediaCleanup' return type */
export type IRetryMediaCleanupResult = void;

/** 'RetryMediaCleanup' query type */
export interface IRetryMediaCleanupQuery {
  params: IRetryMediaCleanupParams;
  result: IRetryMediaCleanupResult;
}

const retryMediaCleanupIR: any = {"usedParamSet":{"fileId":true},"params":[{"name":"fileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":175,"b":182}]}],"statement":"UPDATE media_cleanup_jobs SET attempts=attempts+1, leased_until=NULL,\navailable_at=NOW()+make_interval(secs=>LEAST(3600,60*power(2,LEAST(attempts,6)))::integer)\nWHERE file_id=:fileId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE media_cleanup_jobs SET attempts=attempts+1, leased_until=NULL,
 * available_at=NOW()+make_interval(secs=>LEAST(3600,60*power(2,LEAST(attempts,6)))::integer)
 * WHERE file_id=:fileId!
 * ```
 */
export const retryMediaCleanup = new PreparedQuery<IRetryMediaCleanupParams,IRetryMediaCleanupResult>(retryMediaCleanupIR);


