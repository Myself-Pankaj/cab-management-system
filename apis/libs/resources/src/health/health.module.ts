import { Module } from '@nestjs/common';
import { HealthRepository } from '@app/core';
import { HealthService } from './health.service.js';

@Module({
  providers: [HealthRepository, HealthService],
  exports: [HealthService],
})
export class HealthModule {}
