import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AdminRidesController } from './admin-rides.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [AdminRidesController],
})
export class AppAdminRidesModule {}
