import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@app/core';
import type { JwtClaims, TokenType } from '../types/auth.types.js';
import type { GlobalRole } from '../types/auth.types.js';
import { AuthErrors, AppError } from '../types/auth-errors.js';

export interface TokenPayloadInput {
  userId: string;
  email: string;
  phoneNumber: string;
  role: GlobalRole | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  tokenType: TokenType;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  generateToken(input: TokenPayloadInput): string {
    const auth = this.config.auth;
    const expiresIn =
      input.tokenType === 'access'
        ? auth.accessExpirySeconds
        : auth.refreshExpirySeconds;

    return this.jwtService.sign(
      {
        user_id: input.userId,
        email: input.email,
        phone_number: input.phoneNumber,
        role: input.role,
        email_verified: input.emailVerified,
        phone_verified: input.phoneVerified,
        token_type: input.tokenType,
      },
      {
        secret: auth.jwtSecret,
        issuer: auth.jwtIssuer,
        subject: input.userId,
        expiresIn,
      },
    );
  }

  validateToken(token: string, expectedType: TokenType): JwtClaims {
    try {
      const claims = this.jwtService.verify<JwtClaims>(token, {
        secret: this.config.auth.jwtSecret,
        issuer: this.config.auth.jwtIssuer,
      });

      if (claims.token_type !== expectedType) {
        throw AuthErrors.invalidToken();
      }

      return claims;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AuthErrors.invalidToken();
    }
  }

  getAccessExpiryDate(): Date {
    return new Date(Date.now() + this.config.auth.accessExpirySeconds * 1000);
  }

  getRefreshExpiryDate(): Date {
    return new Date(Date.now() + this.config.auth.refreshExpirySeconds * 1000);
  }
}
