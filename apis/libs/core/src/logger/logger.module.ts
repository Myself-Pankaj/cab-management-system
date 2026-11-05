import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppConfigService } from '../config/config.service.js';
import { buildWinstonOptions } from '../config/config.factory.js';
import { AppLogger } from './logger.service.js';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) =>
        buildWinstonOptions(appConfig.logger),
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger, WinstonModule],
})
export class LoggerModule {}
