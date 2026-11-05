import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { DriversController } from './drivers.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [DriversController],
})
export class AppDriversModule {}
