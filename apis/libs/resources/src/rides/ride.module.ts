import { Module } from '@nestjs/common';
import { DriverModule } from '../drivers/driver.module.js';
import { UserRepository } from '../auth/repositories/user.repository.js';
import { MapsService } from '../maps/maps.service.js';
import { VehicleFareRateRepository } from './repositories/vehicle-fare-rate.repository.js';
import { RideRepository } from './repositories/ride.repository.js';
import { RidePassengerRepository } from './repositories/ride-passenger.repository.js';
import { PaymentRepository } from './repositories/payment.repository.js';
import { RideStatusHistoryRepository } from './repositories/ride-status-history.repository.js';
import { RideCancellationRepository } from './repositories/ride-cancellation.repository.js';
import { FareCalculatorService } from './services/fare-calculator.service.js';
import { PaymentSummaryService } from './services/payment-summary.service.js';
import { RideStatusService } from './services/ride-status.service.js';
import { PassengerValidationService } from './services/passenger-validation.service.js';
import {
  RideQuoteService,
} from './services/ride-quote.service.js';
import { VehicleCategoryService } from './services/vehicle-category.service.js';
import { RideBookingService } from './services/ride-booking.service.js';
import { RazorpayService } from './services/razorpay.service.js';
import { PaymentWebhookService } from './services/payment-webhook.service.js';
import { AdminRideService } from './services/admin-ride.service.js';

@Module({
  imports: [DriverModule],
  providers: [
    MapsService,
    UserRepository,
    VehicleFareRateRepository,
    RideRepository,
    RidePassengerRepository,
    PaymentRepository,
    RideStatusHistoryRepository,
    RideCancellationRepository,
    FareCalculatorService,
    PaymentSummaryService,
    RideStatusService,
    PassengerValidationService,
    VehicleCategoryService,
    RideQuoteService,
    RideBookingService,
    RazorpayService,
    PaymentWebhookService,
    AdminRideService,
  ],
  exports: [
    MapsService,
    VehicleCategoryService,
    RideQuoteService,
    RideBookingService,
    PaymentWebhookService,
    AdminRideService,
    RazorpayService,
  ],
})
export class RideModule {}
