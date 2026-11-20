import { AdminReportingService } from '../../libs/resources/src/admin/admin-reporting.service.js';
import { AdminRidesPageDto } from '../openapi/admin-response.dto.js';
import { DriverRideService } from '@app/resources';
import {
  CompleteDriverRideDto,
  AdminOfferReasonDto,
} from '@app/resources/rides/dto/driver-ride.dto.js';
import {
  DriverRideDetailDto,
  EligibleDriversDto,
} from '../openapi/driver-response.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import { RideDetailDto, PaymentDataDto } from '../openapi/response.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminRideService,
  CurrentUser,
  Roles,
  RolesGuard,
} from '@app/resources';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import {
  AdminListRidesQueryDto,
  AssignRideDto,
  CancelRideDto,
  UpdateRideStatusDto,
} from '@app/resources/rides/dto/ride.dto.js';

@ApiTags('Admin Rides')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('admin/rides')
export class AdminRidesController {
  constructor(
    private readonly adminRideService: AdminRideService,
    private readonly reports: AdminReportingService,
    private readonly driverRides: DriverRideService,
  ) {}

  @Get(':id/eligible-drivers')
  @ApiEnvelope(EligibleDriversDto)
  eligible(@Param('id') id: string) {
    return this.driverRides.candidates(id);
  }
  @Post(':id/offers/:offerId/revoke')
  @HttpCode(200)
  @ApiEnvelope(DriverRideDetailDto)
  revoke(
    @CurrentUser() user: JwtClaims,
    @Param('id') id: string,
    @Param('offerId') offerId: string,
    @Body() dto: AdminOfferReasonDto,
  ) {
    return this.driverRides.release(
      id,
      offerId,
      user.user_id,
      dto.reason,
      dto.operation_id,
    );
  }
  @Post(':id/complete')
  @HttpCode(200)
  @ApiEnvelope(DriverRideDetailDto)
  complete(
    @CurrentUser() user: JwtClaims,
    @Param('id') id: string,
    @Body() dto: CompleteDriverRideDto,
  ) {
    return this.driverRides.complete(id, user.user_id, dto, true);
  }

  @Get()
  @ApiOperation({ summary: 'List rides with optional filters' })
  @ApiEnvelope(AdminRidesPageDto, 200)
  list(@Query() query: AdminListRidesQueryDto) {
    return this.reports.rides(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full ride detail' })
  @ApiEnvelope(DriverRideDetailDto, 200)
  getDetail(@CurrentUser() user: JwtClaims, @Param('id') id: string) {
    return this.driverRides.detail(id, user.user_id, true);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign driver and vehicle to ride' })
  @ApiEnvelope(RideDetailDto, 200)
  assign(
    @CurrentUser() admin: JwtClaims,
    @Param('id') id: string,
    @Body() dto: AssignRideDto,
  ) {
    return this.adminRideService.assignRide(id, admin.user_id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel ride and optionally refund online payments',
  })
  @ApiEnvelope(RideDetailDto, 200)
  cancel(
    @CurrentUser() admin: JwtClaims,
    @Param('id') id: string,
    @Body() dto: CancelRideDto,
  ) {
    return this.adminRideService.cancelRide(id, admin.user_id, dto);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update ride operational status' })
  @ApiEnvelope(RideDetailDto, 200)
  updateStatus(
    @CurrentUser() admin: JwtClaims,
    @Param('id') id: string,
    @Body() dto: UpdateRideStatusDto,
  ) {
    return this.adminRideService.updateStatus(id, admin.user_id, dto);
  }

  @Post(':id/payments/:paymentId/mark-paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deprecated: use ride completion to declare cash collection',
    deprecated: true,
  })
  @ApiEnvelope(PaymentDataDto, 200)
  markOfflinePaid(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.adminRideService.markOfflinePaid(id, paymentId);
  }
}
