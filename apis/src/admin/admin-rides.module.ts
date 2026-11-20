import { AdminReportingModule } from './admin-reporting.module.js';
import { AdminCabsController } from './admin-cabs.controller.js';
import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AdminRidesController } from './admin-rides.controller.js';

@Module({
  imports: [ResourcesModule, AdminReportingModule],
  controllers: [AdminRidesController, AdminCabsController],
})
export class AppAdminRidesModule {}
