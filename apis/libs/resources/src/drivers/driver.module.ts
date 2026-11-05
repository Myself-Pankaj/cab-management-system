import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { UserRepository } from '../auth/repositories/user.repository.js';
import { DriverProfileRepository } from './repositories/driver-profile.repository.js';
import { DriverWalletRepository } from './repositories/driver-wallet.repository.js';
import { DriverDocumentRepository } from './repositories/driver-document.repository.js';
import { DriverBankAccountRepository } from './repositories/driver-bank-account.repository.js';
import { VehicleRepository } from './repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from './repositories/vehicle-document.repository.js';
import { DriverVerificationRepository } from './repositories/driver-verification.repository.js';
import { DriverOnboardingService } from './services/driver-onboarding.service.js';
import { AdminDriverService } from './services/admin-driver.service.js';

@Module({
  imports: [MediaModule],
  providers: [
    UserRepository,
    DriverProfileRepository,
    DriverWalletRepository,
    DriverDocumentRepository,
    DriverBankAccountRepository,
    VehicleRepository,
    VehicleDocumentRepository,
    DriverVerificationRepository,
    DriverOnboardingService,
    AdminDriverService,
  ],
  exports: [
    DriverProfileRepository,
    DriverWalletRepository,
    DriverDocumentRepository,
    DriverBankAccountRepository,
    VehicleRepository,
    VehicleDocumentRepository,
    DriverVerificationRepository,
    DriverOnboardingService,
    AdminDriverService,
  ],
})
export class DriverModule {}
