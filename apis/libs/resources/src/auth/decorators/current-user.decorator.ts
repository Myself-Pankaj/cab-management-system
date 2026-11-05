import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtClaims } from '../types/auth.types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtClaims => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtClaims }>();
    return request.user;
  },
);
