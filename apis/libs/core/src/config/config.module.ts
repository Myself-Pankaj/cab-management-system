import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './config.service.js';
import { ConfigModule as NestConfig } from '@nestjs/config';
import { validateEnv } from './config.validation.js';
import authConfig from './auth.config.js';
import bookingConfig from './booking.config.js';
import driverConfig from './driver.config.js';
import mediaConfig from './media.config.js';
import razorpayConfig from './razorpay.config.js';
import databaseConfig from '../database/database.config.js';
import { loggerConfigRegister } from '../logger/logger.config.js';
import * as path from 'path';

const env = process.env['NODE_ENV'] || 'development';
const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

@Global()
@Module({
  imports: [
    NestConfig.forRoot({
      isGlobal: true,
      envFilePath,
      cache: true,
      expandVariables: true,
      load: [
        authConfig,
        bookingConfig,
        driverConfig,
        mediaConfig,
        razorpayConfig,
        databaseConfig,
        loggerConfigRegister,
      ],
      validate: (config: Record<string, unknown>) => {
        const validated = validateEnv(config);
        return { ...config, ...validated };
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
