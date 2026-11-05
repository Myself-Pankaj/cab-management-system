import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AdminDriversController } from './admin-drivers.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [AdminDriversController],
})
export class AppAdminDriversModule {}
