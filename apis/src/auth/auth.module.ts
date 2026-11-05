import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [AuthController],
})
export class AppAuthModule {}
