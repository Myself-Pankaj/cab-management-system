import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { AppConfigService } from '@app/core';
import type { AuthSessionData, RefreshSessionData, UserResponse } from '../types/auth.types.js';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: AppConfigService) {}

  setAccessTokenCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: this.config.auth.accessExpirySeconds * 1000,
    });
  }

  setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: this.config.auth.refreshExpirySeconds * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
    });
  }

  buildAuthSessionData(
    user: UserResponse,
    accessToken: string,
    refreshToken: string,
    includeRefresh = true,
  ): AuthSessionData {
    const accessExpiresAt = new Date(
      Date.now() + this.config.auth.accessExpirySeconds * 1000,
    ).toISOString();
    const data: AuthSessionData = {
      user,
      access_token: accessToken,
      access_token_expires_at: accessExpiresAt,
    };

    if (includeRefresh) {
      data.refresh_token = refreshToken;
      data.refresh_token_expires_at = new Date(
        Date.now() + this.config.auth.refreshExpirySeconds * 1000,
      ).toISOString();
    }

    return data;
  }

  buildRefreshSessionData(accessToken: string): RefreshSessionData {
    return {
      message: 'Access token refreshed successfully',
      access_token: accessToken,
      access_token_expires_at: new Date(
        Date.now() + this.config.auth.accessExpirySeconds * 1000,
      ).toISOString(),
    };
  }
}
