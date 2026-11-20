import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { requestContext } from './request-context.js';
import { sanitizeLogValue } from './log-sanitizer.js';

@Injectable()
export class AppLogger implements NestLoggerService {
  private context?: string;
  private winstonLogger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger | { logger: Logger },
  ) {
    this.winstonLogger =
      'logger' in this.logger ? this.logger.logger : this.logger;
  }

  /**
   * Creates a new scoped logger instance with its own context.
   * Use this instead of setContext() to avoid shared state issues.
   */
  forContext(context: string): AppLogger {
    const scoped = Object.create(this) as AppLogger;
    scoped.context = context;
    scoped.winstonLogger = this.winstonLogger;
    return scoped;
  }

  /**
   * @deprecated Use forContext() instead to avoid shared state issues in singleton scope
   */
  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.info(message, {
      ...requestContext.getStore(),
      context: ctx,
    });
  }

  error(message: string, trace?: string | Error, context?: string) {
    const ctx = context || this.context || 'Application';

    if (trace instanceof Error) {
      this.winstonLogger.error(message, {
        ...requestContext.getStore(),
        context: ctx,
        error: sanitizeLogValue(trace),
      });
    } else {
      this.winstonLogger.error(message, {
        ...requestContext.getStore(),
        context: ctx,
        trace,
      });
    }
  }

  warn(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.warn(message, {
      ...requestContext.getStore(),
      context: ctx,
    });
  }

  debug(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.debug(message, {
      ...requestContext.getStore(),
      context: ctx,
    });
  }

  verbose(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.verbose(message, {
      ...requestContext.getStore(),
      context: ctx,
    });
  }

  logWithMetadata(
    message: string,
    metadata: Record<string, unknown>,
    context?: string,
  ) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.info(message, {
      ...metadata,
      ...requestContext.getStore(),
      context: ctx,
    });
  }

  warnWithMetadata(
    message: string,
    metadata: Record<string, unknown>,
    context?: string,
  ) {
    this.winstonLogger.warn(message, {
      ...metadata,
      ...requestContext.getStore(),
      context: context || this.context || 'Application',
    });
  }

  errorWithMetadata(
    message: string,
    error: Error,
    metadata?: Record<string, unknown>,
    context?: string,
  ) {
    const ctx = context || this.context || 'Application';
    this.winstonLogger.error(message, {
      ...metadata,
      ...requestContext.getStore(),
      context: ctx,
      error: sanitizeLogValue(error),
    });
  }
}
