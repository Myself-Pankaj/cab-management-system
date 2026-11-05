import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DriverModule } from './drivers/driver.module.js';
import { MediaModule } from './media/media.module.js';
import { RideModule } from './rides/ride.module.js';

/**
 * Domain feature modules live here. Layer contract:
 *
 *   Controller  -> HTTP, DTO validation, auth guards
 *   Service     -> business logic, orchestration, row-to-DTO mapping
 *   Repository  -> SQL only via pgtyped .run() + BaseRepository helpers
 *   DatabaseService -> pool lifecycle, transactions, instrumentation
 *
 * Add new feature modules to imports/exports as they are created.
 */
@Module({
  imports: [HealthModule, AuthModule, DriverModule, MediaModule, RideModule],
  exports: [HealthModule, AuthModule, DriverModule, MediaModule, RideModule],
})
export class ResourcesModule {}
