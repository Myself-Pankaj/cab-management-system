import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { AppLogger } from './logger.service.js';

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();
export const REQUEST_ID_HEADER = 'x-request-id';

export function resolveRequestId(value: unknown): string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
    ? value
    : randomUUID();
}

/** Only log route templates, never user-provided paths or query strings. */
export function requestRoute(request: Request): string {
  const path: unknown = request.route?.path;
  return typeof path === 'string'
    ? `${request.baseUrl || ''}${path}`
    : '(unmatched)';
}

export function requestLoggingMiddleware(logger: AppLogger) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const requestId = resolveRequestId(request.headers[REQUEST_ID_HEADER]);
    request.headers[REQUEST_ID_HEADER] = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);
    const start = process.hrtime.bigint();
    requestContext.run({ requestId }, () => {
      let completed = false;
      const logCompletion = (aborted: boolean) => {
        if (completed) return;
        completed = true;
        logger.logWithMetadata(
          'HTTP request completed',
          {
            requestId,
            method: request.method,
            route: requestRoute(request),
            statusCode: response.statusCode,
            durationMs: Number(process.hrtime.bigint() - start) / 1e6,
            aborted,
          },
          'HTTP',
        );
      };
      response.once('finish', () => logCompletion(false));
      response.once('close', () => logCompletion(!response.writableFinished));
      next();
    });
  };
}
