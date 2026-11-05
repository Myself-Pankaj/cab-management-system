import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigService } from '@app/core';
import { DriverModule } from '../drivers/driver.module.js';
import { UserRepository } from './repositories/user.repository.js';
import { VerificationRepository } from './repositories/verification.repository.js';
import { JwtTokenService } from './services/jwt-token.service.js';
import { AuthCookieService } from './services/auth-cookie.service.js';
import { EmailService } from './services/email.service.js';
import { AuthRegistrationService } from './services/auth-registration.service.js';
import { AuthVerificationService } from './services/auth-verification.service.js';
import { AuthSessionService } from './services/auth-session.service.js';
import { AuthPasswordService } from './services/auth-password.service.js';
import { AuthRoleService } from './services/auth-role.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    DriverModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.auth.jwtSecret,
        signOptions: {
          issuer: config.auth.jwtIssuer,
        },
      }),
    }),
  ],
  providers: [
    UserRepository,
    VerificationRepository,
    JwtTokenService,
    AuthCookieService,
    EmailService,
    AuthRegistrationService,
    AuthVerificationService,
    AuthSessionService,
    AuthPasswordService,
    AuthRoleService,
    RefreshTokenGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    AuthRegistrationService,
    AuthVerificationService,
    AuthSessionService,
    AuthPasswordService,
    AuthRoleService,
    AuthCookieService,
    JwtTokenService,
    UserRepository,
    RefreshTokenGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
