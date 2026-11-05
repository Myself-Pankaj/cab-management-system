import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { RidesController } from './rides.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [RidesController],
})
export class AppRidesModule {}
