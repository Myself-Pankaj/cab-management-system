import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { ResourcesModule } from '@app/resources';
import { AppHealthModule } from './health/health.module.js';
import { AppAuthModule } from './auth/auth.module.js';
import { AppDriversModule } from './drivers/drivers.module.js';
import { AppAdminDriversModule } from './admin/admin-drivers.module.js';
import { AppAdminRidesModule } from './admin/admin-rides.module.js';
import { AppMediaModule } from './media/media.module.js';
import { AppRidesModule } from './rides/rides.module.js';
import { AppWebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    CoreModule,
    ResourcesModule,
    AppHealthModule,
    AppAuthModule,
    AppDriversModule,
    AppAdminDriversModule,
    AppAdminRidesModule,
    AppMediaModule,
    AppRidesModule,
    AppWebhooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
