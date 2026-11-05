import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { HealthController } from './health.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [HealthController],
})
export class AppHealthModule {}
