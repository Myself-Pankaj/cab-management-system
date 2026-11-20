import {
  Body,
  Patch,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@app/resources/auth/decorators/current-user.decorator.js';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import { AdminFleetService } from '../../libs/resources/src/admin/admin-fleet.service.js';
import { AdminVehicleEditDto } from '../../libs/resources/src/admin/admin-edit.dto.js';
import {
  AdminVehicleDetailDto,
  AdminVehicleSavedDto,
  AdminPaymentDetailDto,
} from '../openapi/admin-response.dto.js';
import { Roles, RolesGuard } from '@app/resources';
import { AdminReportingService } from '../../libs/resources/src/admin/admin-reporting.service.js';
import {
  AdminApplicationsQueryDto,
  AdminPaymentsQueryDto,
  AdminUsersQueryDto,
  AdminVehiclesQueryDto,
} from '../../libs/resources/src/admin/admin-query.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  AdminApplicationsPageDto,
  AdminDashboardSummaryDto,
  AdminPaymentsPageDto,
  AdminUserDto,
  AdminUsersPageDto,
  AdminVehiclesPageDto,
} from '../openapi/admin-response.dto.js';
@ApiTags('Admin Reporting')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('admin')
export class AdminReportingController {
  constructor(
    private readonly reports: AdminReportingService,
    private readonly fleet: AdminFleetService,
  ) {}
  @Get('dashboard/summary')
  @ApiEnvelope(AdminDashboardSummaryDto)
  summary() {
    return this.reports.summary();
  }
  @Get('users')
  @ApiEnvelope(AdminUsersPageDto)
  users(@Query() q: AdminUsersQueryDto) {
    return this.reports.users(q);
  }
  @Get('users/:id')
  @ApiEnvelope(AdminUserDto)
  user(@Param('id', ParseUUIDPipe) id: string) {
    return this.reports.user(id);
  }
  @Get('vehicles')
  @ApiEnvelope(AdminVehiclesPageDto)
  vehicles(@Query() q: AdminVehiclesQueryDto) {
    return this.reports.vehicles(q);
  }
  @Get('vehicles/:id')
  @ApiEnvelope(AdminVehicleDetailDto)
  vehicle(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleet.detail(id);
  }
  @Patch('vehicles/:id')
  @ApiEnvelope(AdminVehicleSavedDto)
  updateVehicle(
    @CurrentUser() actor: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminVehicleEditDto,
  ) {
    return this.fleet.update(id, actor.user_id, dto);
  }
  @Get('payments/:id')
  @ApiEnvelope(AdminPaymentDetailDto)
  payment(@Param('id', ParseUUIDPipe) id: string) {
    return this.reports.payment(id);
  }
  @Get('payments')
  @ApiEnvelope(AdminPaymentsPageDto)
  payments(@Query() q: AdminPaymentsQueryDto) {
    return this.reports.payments(q);
  }
  @Get('verifications')
  @ApiEnvelope(AdminApplicationsPageDto)
  applications(@Query() q: AdminApplicationsQueryDto) {
    return this.reports.applications(q);
  }
}
