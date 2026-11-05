import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtTokenService } from '../services/jwt-token.service.js';
import type { JwtClaims } from '../types/auth.types.js';

function extractBearerToken(authHeader?: string): string | undefined {
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }
  return authHeader.slice(7).trim();
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<
      Request & {
        cookies?: Record<string, string>;
        body?: { refresh_token?: string };
        user?: JwtClaims;
      }
    >();

    const token =
      request.cookies?.['refresh_token'] ??
      extractBearerToken(request.headers.authorization) ??
      request.body?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token required');
    }

    try {
      const claims = this.jwtTokenService.validateToken(token, 'refresh');
      request.user = claims;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
