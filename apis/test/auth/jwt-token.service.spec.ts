import { describe, expect, it } from 'vitest';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppConfigService } from '@app/core';
import { JwtTokenService } from '@app/resources/auth/services/jwt-token.service.js';

describe('JwtTokenService', () => {
  it('signs and validates access and refresh tokens', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'unit-test-secret',
          signOptions: { issuer: 'cab-test' },
        }),
      ],
      providers: [
        JwtTokenService,
        {
          provide: AppConfigService,
          useValue: {
            auth: {
              jwtSecret: 'unit-test-secret',
              jwtIssuer: 'cab-test',
              accessExpirySeconds: 900,
              refreshExpirySeconds: 604800,
            },
          },
        },
      ],
    }).compile();

    const jwtTokenService = moduleRef.get(JwtTokenService);

    const accessToken = jwtTokenService.generateToken({
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      phoneNumber: '+919876543210',
      role: 'Passenger',
      emailVerified: true,
      phoneVerified: false,
      tokenType: 'access',
    });

    const refreshToken = jwtTokenService.generateToken({
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      phoneNumber: '+919876543210',
      role: 'Passenger',
      emailVerified: true,
      phoneVerified: false,
      tokenType: 'refresh',
    });

    const accessClaims = jwtTokenService.validateToken(accessToken, 'access');
    expect(accessClaims.user_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(accessClaims.token_type).toBe('access');

    const refreshClaims = jwtTokenService.validateToken(refreshToken, 'refresh');
    expect(refreshClaims.token_type).toBe('refresh');
  });
});
