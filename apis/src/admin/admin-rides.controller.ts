import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  RidesDataDto,
  RideDetailDto,
  PaymentDataDto,
} from '../openapi/response.dto.js';
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
import type { ride_status } from '@db/queries/rides/rides.queries.js';
import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';

@ApiTags('Admin Rides')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('admin/rides')
export class AdminRidesController {
  constructor(private readonly adminRideService: AdminRideService) {}

  @Get()
  @ApiOperation({ summary: 'List rides with optional filters' })
  @ApiEnvelope(RidesDataDto, 200)
  list(@Query() query: AdminListRidesQueryDto) {
    return this.adminRideService.listRides(
      query.status as ride_status | undefined,
      query.category as vehicle_category | undefined,
      query.limit ?? 20,
      query.offset ?? 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full ride detail' })
  @ApiEnvelope(RideDetailDto, 200)
  getDetail(@Param('id') id: string) {
    return this.adminRideService.getRideDetail(id);
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
  @ApiOperation({ summary: 'Mark offline payment as collected' })
  @ApiEnvelope(PaymentDataDto, 200)
  markOfflinePaid(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.adminRideService.markOfflinePaid(id, paymentId);
  }
}
