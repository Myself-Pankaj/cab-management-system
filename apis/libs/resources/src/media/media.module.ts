import { Module } from '@nestjs/common';
import { ImageRepository } from './repositories/image.repository.js';
import { ImageKitService } from './services/imagekit.service.js';
import { MediaService } from './services/media.service.js';
import { DriverProfileRepository } from '../drivers/repositories/driver-profile.repository.js';
import { DriverDocumentRepository } from '../drivers/repositories/driver-document.repository.js';
import { VehicleRepository } from '../drivers/repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../drivers/repositories/vehicle-document.repository.js';

@Module({
  providers: [
    ImageRepository,
    ImageKitService,
    MediaService,
    DriverProfileRepository,
    DriverDocumentRepository,
    VehicleRepository,
    VehicleDocumentRepository,
  ],
  exports: [MediaService, ImageRepository],
})
export class MediaModule {}
