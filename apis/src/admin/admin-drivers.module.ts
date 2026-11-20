import { AdminReportingModule } from './admin-reporting.module.js';
import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AdminDriversController } from './admin-drivers.controller.js';

@Module({
  imports: [ResourcesModule, AdminReportingModule],
  controllers: [AdminDriversController],
})
export class AppAdminDriversModule {}
