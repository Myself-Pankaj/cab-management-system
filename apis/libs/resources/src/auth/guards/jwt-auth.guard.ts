import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtTokenService } from '../services/jwt-token.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { JwtClaims } from '../types/auth.types.js';

function extractBearerToken(authHeader?: string): string | undefined {
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }
  return authHeader.slice(7).trim();
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & { cookies?: Record<string, string>; user?: JwtClaims }
    >();

    const token =
      request.cookies?.['access_token'] ??
      extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const claims = this.jwtTokenService.validateToken(token, 'access');
      request.user = claims;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
