import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { LoggerModule } from './logger/logger.module.js';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule],
  exports: [ConfigModule, LoggerModule, DatabaseModule],
})
export class CoreModule {}
