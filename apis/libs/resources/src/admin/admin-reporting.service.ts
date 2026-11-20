import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminReportingRepository } from './admin-reporting.repository.js';
import { RideBookingService } from '../rides/services/ride-booking.service.js';
import { toRideResponse } from '../rides/types/ride.types.js';
import type {
  AdminApplicationsQueryDto,
  AdminPaymentsQueryDto,
  AdminUsersQueryDto,
  AdminVehiclesQueryDto,
} from './admin-query.dto.js';
import type { AdminListRidesQueryDto } from '../rides/dto/ride.dto.js';

@Injectable()
export class AdminReportingService {
  constructor(
    private readonly reports: AdminReportingRepository,
    private readonly booking: RideBookingService,
  ) {}
  async summary() {
    const {
      pendingReviews,
      awaitingRides,
      recentVerifications,
      recentBookings,
      ...data
    } = await this.reports.summary();
    const percent = (value: number | null) =>
      data.users.total
        ? Math.round(((value ?? 0) / data.users.total) * 10000) / 100
        : 0;
    const percentages = {
      drivers: percent(data.users.drivers),
      passengers: percent(data.users.passengers),
      admins: percent(data.users.admins),
      unselected: percent(data.users.unselected),
    };
    return {
      ...data,
      users: { ...data.users, percentages },
      recent_verifications: recentVerifications,
      recent_bookings: recentBookings.map((r) => ({
        ...toRideResponse(r),
        status: r.operational_status,
      })),
      pending_reviews: pendingReviews,
      awaiting_rides: awaitingRides.map((r) => ({
        ...toRideResponse(r),
        status: r.operational_status,
      })),
    };
  }
  async payment(id: string) {
    const payment = await this.reports.payment(id);
    if (!payment) throw new NotFoundException('Payment not found');
    const ride = await this.reports.paymentRide(payment.ride_id);
    if (!ride) throw new NotFoundException('Ride not found');
    const detail = await this.booking.buildRideDetail(ride);
    return {
      payment: { ...payment, amount: Number(payment.amount) },
      payment_summary: detail.payment_summary,
    };
  }
  users(q: AdminUsersQueryDto) {
    return this.reports.users(q);
  }
  async user(id: string) {
    const user = await this.reports.user(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  applications(q: AdminApplicationsQueryDto) {
    return this.reports.applications(q);
  }
  vehicles(q: AdminVehiclesQueryDto) {
    return this.reports.vehicles(q);
  }
  async payments(q: AdminPaymentsQueryDto) {
    if (q.dateFrom && q.dateTo && new Date(q.dateFrom) >= new Date(q.dateTo))
      throw new BadRequestException('End date must follow start date');
    return this.reports.payments(q);
  }
  async rides(q: AdminListRidesQueryDto) {
    const page = await this.reports.rides(q);
    const items = page.items.map((r) => ({
      ...toRideResponse(r),
      status: r.operational_status,
    }));
    return { ...page, items, rides: items };
  }
}
