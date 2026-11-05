import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { MediaController } from './media.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [MediaController],
})
export class AppMediaModule {}
