import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  requestContext,
  requestRoute,
  resolveRequestId,
  REQUEST_ID_HEADER,
} from '../logger/request-context.js';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppConfigService } from '../config/config.service.js';
import { AppLogger } from '../logger/logger.service.js';
import {
  ErrorResponse,
  HttpExceptionResponse,
  ResponseBuilder,
} from '../interceptor/interceptor.interface.js';

/**
 * Shape of errors thrown by node-postgres (`pg`)'s DatabaseError.
 * See: https://github.com/brianc/node-postgres/blob/master/packages/pg-protocol/src/messages.ts
 */
interface PostgresError extends Error {
  code: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  schema?: string;
  dataType?: string;
  severity?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  routine?: string;
  cause?: unknown;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Postgres SQLSTATE codes we map to specific HTTP responses.
 * Anything not listed here falls through to a generic 500
 * "Database error" so we never leak schema/constraint details
 * to the client.
 */
const POSTGRES_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string; errorCode: string }
> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    message: 'Resource already exists',
    errorCode: 'DUPLICATE_RESOURCE',
  },
  '23503': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Referenced resource does not exist',
    errorCode: 'INVALID_REFERENCE',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Required field is missing',
    errorCode: 'REQUIRED_FIELD',
  },
  '23514': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid value provided',
    errorCode: 'INVALID_VALUE',
  },
  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid value provided',
    errorCode: 'INVALID_VALUE',
  },
  '22003': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Value out of range',
    errorCode: 'OUT_OF_RANGE',
  },
  '40001': {
    status: HttpStatus.CONFLICT,
    message: 'Transaction conflict, please retry',
    errorCode: 'TRANSACTION_CONFLICT',
  },
  '40P01': {
    status: HttpStatus.CONFLICT,
    message: 'Database transaction conflict',
    errorCode: 'DEADLOCK_DETECTED',
  },
  '53300': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
  '08001': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
  '08006': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
  '57P01': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
  '57P02': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
  '57P03': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database is temporarily unavailable',
    errorCode: 'DATABASE_UNAVAILABLE',
  },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly scopedLogger: AppLogger;
  private readonly isProduction: boolean;

  constructor(
    private readonly logger: AppLogger,
    appConfig: AppConfigService,
  ) {
    this.scopedLogger = this.logger.forContext('HTTP');
    this.isProduction = appConfig.isProduction;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      requestContext.getStore()?.requestId ??
      resolveRequestId(request.headers[REQUEST_ID_HEADER]);
    const errorResponse = this.resolveError(exception, request.path, requestId);

    this.logException(exception, request, errorResponse, requestId);

    // Surface the id even if a client never reads the body.
    if (response.headersSent) {
      // A streaming response cannot be replaced with a JSON error.
      response.end();
      return;
    }
    response.setHeader(REQUEST_ID_HEADER, requestId);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  // ---------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------

  private logException(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
    requestId: string,
  ): void {
    const metadata = {
      requestId,
      method: request.method,
      route: requestRoute(request),
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.error.code,
    };
    if (errorResponse.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.scopedLogger.errorWithMetadata(
        'HTTP request failed',
        this.toError(exception),
        metadata,
      );
    } else {
      this.scopedLogger.warnWithMetadata('HTTP request rejected', metadata);
    }
  }

  private toError(exception: unknown): Error {
    if (exception instanceof Error) {
      return exception;
    }
    return new Error('A non-Error value was thrown');
  }

  // ---------------------------------------------------------------------
  // Error resolution
  // ---------------------------------------------------------------------

  private resolveError(
    exception: unknown,
    path: string,
    requestId: string,
  ): ErrorResponse {
    const zodError = this.findZodError(exception);
    if (zodError) {
      return this.handleZodError(zodError, exception, path, requestId);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, path, requestId);
    }

    const postgresError = this.findPostgresError(exception);
    if (postgresError) {
      return this.handlePostgresError(postgresError, path, requestId);
    }

    // Anything else (raw strings, plain objects, programming errors like
    // TypeError/ReferenceError) is treated as an unhandled 500. We never
    // forward exception.message to the client here — it may contain
    // internal file paths, SQL fragments, or other implementation detail.
    return ResponseBuilder.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      path,
      'INTERNAL_ERROR',
      { details: { requestId, ...this.devDetails(exception) } },
    );
  }

  private handleHttpException(
    exception: HttpException,
    path: string,
    requestId: string,
  ): ErrorResponse {
    const status = exception.getStatus();
    const body = exception.getResponse();

    let message = exception.message || 'Bad Request';
    let validationErrors: ValidationErrorDetail[] | undefined;

    if (typeof body === 'string') {
      message = body;
    } else if (body && typeof body === 'object') {
      const exceptionResponse = body as HttpExceptionResponse;

      if (Array.isArray(exceptionResponse.message)) {
        message = 'Validation failed';
        validationErrors = exceptionResponse.message.map((msg) =>
          this.parseValidationMessage(msg),
        );
      } else if (typeof exceptionResponse.message === 'string') {
        message = exceptionResponse.message;
      }
    }

    const candidate = (exception as HttpException & { errorCode?: unknown })
      .errorCode;
    const errorCode =
      typeof candidate === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(candidate)
        ? candidate
        : 'HTTP_EXCEPTION';
    // Generic server exceptions may contain provider internals. Domain errors
    // have explicit public messages and machine-readable codes.
    if (this.isProduction && status >= 500 && errorCode === 'HTTP_EXCEPTION') {
      message = 'Internal server error';
      validationErrors = undefined;
    }
    const summary =
      body && typeof body === 'object' && 'payment_summary' in body
        ? body.payment_summary
        : undefined;
    const safeSummary =
      summary &&
      typeof summary === 'object' &&
      'remaining_amount' in summary &&
      typeof summary.remaining_amount === 'number'
        ? { remaining_amount: summary.remaining_amount }
        : undefined;
    return ResponseBuilder.error(status, message, path, errorCode, {
      validationErrors,
      details: {
        requestId,
        ...(errorCode === 'VEHICLE_EDIT_BLOCKED' &&
        typeof body === 'object' &&
        body
          ? {
              blockingRideIds:
                'blockingRideIds' in body && Array.isArray(body.blockingRideIds)
                  ? body.blockingRideIds.filter(
                      (id: unknown) => typeof id === 'string',
                    )
                  : [],
              blockingOfferIds:
                'blockingOfferIds' in body &&
                Array.isArray(body.blockingOfferIds)
                  ? body.blockingOfferIds.filter(
                      (id: unknown) => typeof id === 'string',
                    )
                  : [],
            }
          : {}),
        ...(status === 409 && safeSummary
          ? { payment_summary: safeSummary }
          : {}),
      },
    });
  }

  /**
   * class-validator messages look like "email must be an email" or, for
   * nested DTOs, "profile.address.zip must be longer than...". Splitting
   * on the first space breaks for multi-word property paths, so we only
   * treat the leading token as the field if it looks like a property
   * path (dot/bracket notation, no spaces) and otherwise leave `field`
   * empty rather than guessing wrong.
   */
  private parseValidationMessage(msg: string): ValidationErrorDetail {
    const match = msg.match(/^([a-zA-Z0-9_.[\]]+)\s+(.*)$/);
    if (match) {
      return { field: match[1], message: msg };
    }
    return { field: '', message: msg };
  }

  // ---------------------------------------------------------------------
  // Zod validation errors
  // ---------------------------------------------------------------------

  /**
   * Handles both a raw `ZodError` (e.g. thrown directly from a `.parse()`
   * call in a service or a custom pipe) and the common wrapped case where
   * a library like `nestjs-zod` throws an `HttpException` whose original
   * `ZodError` is reachable via `.getZodError()` or `.cause`.
   */
  private findZodError(exception: unknown): ZodError | undefined {
    if (exception instanceof ZodError) {
      return exception;
    }

    if (exception && typeof exception === 'object') {
      const candidate = exception as {
        getZodError?: () => unknown;
        cause?: unknown;
      };

      if (typeof candidate.getZodError === 'function') {
        try {
          const zodError = candidate.getZodError();
          if (zodError instanceof ZodError) {
            return zodError;
          }
        } catch {
          // getZodError() throwing is not our problem to surface here.
        }
      }

      if (candidate.cause instanceof ZodError) {
        return candidate.cause;
      }
    }

    return undefined;
  }

  private handleZodError(
    zodError: ZodError,
    originalException: unknown,
    path: string,
    requestId: string,
  ): ErrorResponse {
    // Preserve the status code if this came wrapped in an HttpException
    // (e.g. nestjs-zod defaults to 400/422 depending on config); otherwise
    // a raw ZodError thrown outside the HTTP pipeline defaults to 400.
    const status =
      originalException instanceof HttpException
        ? originalException.getStatus()
        : HttpStatus.BAD_REQUEST;

    const validationErrors: ValidationErrorDetail[] = zodError.issues.map(
      (issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : '(root)',
        message: issue.message,
      }),
    );

    return ResponseBuilder.error(
      status,
      'Validation failed',
      path,
      'VALIDATION_ERROR',
      {
        validationErrors,
        details: { requestId },
      },
    );
  }

  // ---------------------------------------------------------------------
  // Postgres / driver error handling
  // ---------------------------------------------------------------------

  private isPostgresError(exception: unknown): exception is PostgresError {
    return (
      exception instanceof Error &&
      'code' in exception &&
      typeof (exception as PostgresError).code === 'string' &&
      /^[0-9A-Z]{5}$/.test((exception as PostgresError).code)
    );
  }

  /**
   * ORMs (TypeORM's QueryFailedError, Prisma's wrapped driver errors, etc.)
   * often wrap the raw pg error rather than exposing `code` directly.
   * We walk a couple of common wrapper shapes so those still map to the
   * right response instead of falling through to a generic 500.
   */
  private findPostgresError(exception: unknown): PostgresError | undefined {
    if (this.isPostgresError(exception)) {
      return exception;
    }

    if (exception && typeof exception === 'object') {
      const candidate =
        (exception as { driverError?: unknown }).driverError ??
        (exception as { cause?: unknown }).cause;

      if (candidate && this.isPostgresError(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  private handlePostgresError(
    exception: PostgresError,
    path: string,
    requestId: string,
  ): ErrorResponse {
    const mapped = POSTGRES_ERROR_MAP[exception.code];

    if (mapped) {
      return ResponseBuilder.error(
        mapped.status,
        mapped.message,
        path,
        mapped.errorCode,
        { details: { requestId, ...this.devDetails(exception) } },
      );
    }

    return ResponseBuilder.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Database error',
      path,
      'DATABASE_ERROR',
      { details: { requestId, ...this.devDetails(exception) } },
    );
  }

  // ---------------------------------------------------------------------
  // Dev-only detail leakage guard
  // ---------------------------------------------------------------------

  /**
   * Stack traces and driver-level detail (constraint names, table/column
   * names, raw messages) are invaluable while developing but are an
   * information-disclosure risk in production. Only attach them when
   * NODE_ENV !== 'production'.
   */
  private devDetails(exception: unknown): Record<string, unknown> {
    if (this.isProduction) {
      return {};
    }

    if (exception instanceof Error) {
      const pg = this.isPostgresError(exception) ? exception : undefined;
      return {
        debug: {
          message: exception.message,
          stack: exception.stack,
          ...(pg
            ? {
                pgCode: pg.code,
                pgDetail: pg.detail,
                pgConstraint: pg.constraint,
                pgTable: pg.table,
                pgColumn: pg.column,
                pgSchema: pg.schema,
                pgSeverity: pg.severity,
                pgHint: pg.hint,
                pgWhere: pg.where,
                pgRoutine: pg.routine,
              }
            : {}),
        },
      };
    }

    return { debug: { raw: exception } };
  }
}
