import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { DriverOnboardingService } from '../drivers/services/driver-onboarding.service.js';
import { VehicleRepository } from '../drivers/repositories/vehicle.repository.js';
import { DriverProfileRepository } from '../drivers/repositories/driver-profile.repository.js';
import { VehicleDocumentRepository } from '../drivers/repositories/vehicle-document.repository.js';
import { DriverVerificationRepository } from '../drivers/repositories/driver-verification.repository.js';
import { AdminReportingRepository } from './admin-reporting.repository.js';
import { adminMutation } from './admin-mutation.js';
import type { AdminVehicleEditDto } from './admin-edit.dto.js';

@Injectable()
export class AdminFleetService {
  constructor(
    private readonly db: DatabaseService,
    private readonly reports: AdminReportingRepository,
    private readonly vehicles: VehicleRepository,
    private readonly profiles: DriverProfileRepository,
    private readonly documents: VehicleDocumentRepository,
    private readonly verifications: DriverVerificationRepository,
    private readonly onboarding: DriverOnboardingService,
  ) {}
  async detail(id: string) {
    const record = await this.vehicles.findById(id);
    if (!record) throw new NotFoundException('Vehicle not found');
    const app = await this.onboarding.getApplication(record.driver_profile_id);
    const vehicle = app.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    const profile = await this.profiles.findById(record.driver_profile_id);
    const driver = profile ? await this.reports.user(profile.user_id) : null;
    return {
      vehicle,
      driver: driver ?? null,
      blocking: await this.reports.vehicleBlockers(id),
      audit: await this.reports.vehicleAudit(id),
    };
  }
  async update(id: string, actor: string, dto: AdminVehicleEditDto) {
    const initial = await this.vehicles.findById(id);
    if (!initial) throw new NotFoundException('Vehicle not found');
    return this.db.withTransaction((client) =>
      adminMutation(
        client,
        actor,
        dto.operation_id,
        `vehicle:${id}`,
        dto,
        async () => {
          await this.profiles.lockById(initial.driver_profile_id, client);
          // Same profile -> vehicle lock order as offer creation/acceptance/start/completion.
          const { rows } = await client.query<typeof initial>(
            'SELECT * FROM vehicles WHERE id=$1 FOR UPDATE',
            [id],
          );
          const before = rows[0];
          if (!before || before.driver_profile_id !== initial.driver_profile_id)
            throw new ConflictException('Vehicle ownership changed; refresh');
          if (before.updated_at.toISOString() !== dto.expected_updated_at)
            throw new ConflictException(
              'Vehicle changed; refresh and review before saving',
            );
          const values = {
            vehicleNumber: dto.vehicle_number.trim().toUpperCase(),
            vehicleType: dto.vehicle_type,
            make: dto.make?.trim() || null,
            model: dto.model?.trim() || null,
            color: dto.color?.trim() || null,
            manufacturingYear: dto.manufacturing_year ?? null,
            active: dto.is_active,
          };
          const previous = {
            vehicleNumber: before.vehicle_number.trim().toUpperCase(),
            vehicleType: before.vehicle_type,
            make: before.make,
            model: before.model,
            color: before.color,
            manufacturingYear: before.manufacturing_year,
            active: before.is_active,
          };
          if (JSON.stringify(previous) === JSON.stringify(values))
            return { vehicle: before };
          const blocking = await this.reports.vehicleBlockers(id, client);
          if (blocking.length) {
            const error = new ConflictException({
              message:
                'Vehicle cannot be edited while assigned to an active ride.',
              blockingRideIds: [...new Set(blocking.map((b) => b.ride_id))],
              blockingOfferIds: blocking.flatMap((b) =>
                b.offer_id ? [b.offer_id] : [],
              ),
            });
            Object.assign(error, { errorCode: 'VEHICLE_EDIT_BLOCKED' });
            throw error;
          }
          const complianceChanged =
            previous.vehicleNumber !== values.vehicleNumber ||
            previous.vehicleType !== values.vehicleType;
          if (
            (complianceChanged || previous.active !== values.active) &&
            !dto.reason?.trim()
          )
            throw new BadRequestException(
              'A reason is required for registration, category or activity changes',
            );
          const [vehicle] = await this.reports.updateVehicle(
            { id, ...values },
            client,
          );
          await this.reports.auditVehicle(
            {
              vehicleId: id,
              actorId: actor,
              reason: dto.reason?.trim() || null,
              before: JSON.stringify(previous),
              after: JSON.stringify(values),
            },
            client,
          );
          if (complianceChanged) {
            for (const document of await this.documents.listByVehicleId(
              id,
              client,
            ))
              await this.documents.updateReview(
                document.id,
                'PENDING',
                null,
                client,
              );
            await this.verifications.create(initial.driver_profile_id, client);
          }
          return { vehicle };
        },
      ),
    );
  }
}
