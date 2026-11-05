import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  AuthConfig,
  BookingConfig,
  DatabaseConfig,
  DriverConfig,
  MediaConfig,
  LoggerConfig,
  RazorpayConfig,
} from './config.interface.js';
import { EnvironmentVariables } from './env.schema.js';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): EnvironmentVariables['NODE_ENV'] {
    return this.configService.getOrThrow<EnvironmentVariables['NODE_ENV']>(
      'NODE_ENV',
    );
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }

  get appConfig(): AppConfig {
    return {
      port: this.configService.getOrThrow<number>('PORT'),
      host: this.configService.getOrThrow<string>('HOST'),
      allowedOrigin:
        this.configService.getOrThrow<string[]>('ALLOWED_ORIGINS'),
    };
  }

  get database(): DatabaseConfig {
    return this.configService.getOrThrow<DatabaseConfig>('database');
  }

  get logger(): LoggerConfig {
    return this.configService.getOrThrow<LoggerConfig>('logger');
  }

  get auth(): AuthConfig {
    return this.configService.getOrThrow<AuthConfig>('auth');
  }

  get driver(): DriverConfig {
    return this.configService.getOrThrow<DriverConfig>('driver');
  }

  get media(): MediaConfig {
    return this.configService.getOrThrow<MediaConfig>('media');
  }

  get booking(): BookingConfig {
    return this.configService.getOrThrow<BookingConfig>('booking');
  }

  get razorpay(): RazorpayConfig {
    return this.configService.getOrThrow<RazorpayConfig>('razorpay');
  }

  get serviceName(): string {
    return this.database.serviceName;
  }

  get slowQueryMs(): number {
    return this.database.slowQueryMs;
  }
}
