import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ResponseBuilder, SuccessResponse } from './interceptor.interface.js';
import { AppConfigService } from '../config/config.service.js';
import { AppLogger } from '../logger/logger.service.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // If already wrapped, pass through
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'statusCode' in data
        ) {
          return data;
        }

        // Wrap response in standard format using ResponseBuilder
        const response = ResponseBuilder.success(data, request.path);

        return response;
      }),
    );
  }
}
