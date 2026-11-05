import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/** Documents the envelope added by ResponseInterceptor without changing responses. */
export function ApiEnvelope(
  model: Type<unknown>,
  status = 200,
  isArray = false,
) {
  const item = { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        type: 'object',
        required: ['success', 'message', 'data', 'timestamp', 'path'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string' },
          data: isArray ? { type: 'array', items: item } : item,
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string' },
        },
      },
    }),
  );
}
