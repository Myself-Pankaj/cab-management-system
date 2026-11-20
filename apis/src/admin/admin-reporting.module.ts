import { AdminFleetService } from '../../libs/resources/src/admin/admin-fleet.service.js';
import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AdminReportingRepository } from '../../libs/resources/src/admin/admin-reporting.repository.js';
import { AdminReportingService } from '../../libs/resources/src/admin/admin-reporting.service.js';
import { AdminReportingController } from './admin-reporting.controller.js';
@Module({
  imports: [ResourcesModule],
  controllers: [AdminReportingController],
  providers: [
    AdminReportingRepository,
    AdminReportingService,
    AdminFleetService,
  ],
  exports: [AdminReportingService],
})
export class AdminReportingModule {}
