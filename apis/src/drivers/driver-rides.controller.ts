import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  DriverRideService,
  Roles,
  RolesGuard,
} from '@app/resources';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import {
  CompleteDriverRideDto,
  DriverRidesQueryDto,
  OfferReasonDto,
} from '@app/resources/rides/dto/driver-ride.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  DriverOffersDto,
  DriverRideDetailDto,
  OfferResultDto,
} from '../openapi/driver-response.dto.js';
@ApiTags('Driver Rides')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Driver')
@Controller('drivers/me')
export class DriverRidesController {
  constructor(private readonly rides: DriverRideService) {}
  @Get('rides')
  @ApiEnvelope(DriverOffersDto)
  list(@CurrentUser() user: JwtClaims, @Query() query: DriverRidesQueryDto) {
    return this.rides.list(user.user_id, query.view, query.limit, query.offset);
  }
  @Get('rides/:id')
  @ApiEnvelope(DriverRideDetailDto)
  detail(
    @CurrentUser() user: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rides.detail(id, user.user_id);
  }
  @Post('offers/:id/accept')
  @HttpCode(200)
  @ApiEnvelope(OfferResultDto)
  accept(
    @CurrentUser() user: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rides.respond(id, user.user_id, 'ACCEPTED');
  }
  @Post('offers/:id/reject')
  @HttpCode(200)
  @ApiEnvelope(OfferResultDto)
  reject(
    @CurrentUser() user: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OfferReasonDto,
  ) {
    return this.rides.respond(id, user.user_id, 'REJECTED', dto.reason);
  }
  @Post('rides/:id/start')
  @HttpCode(200)
  @ApiEnvelope(DriverRideDetailDto)
  start(
    @CurrentUser() user: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rides.start(id, user.user_id);
  }
  @Post('rides/:id/complete')
  @HttpCode(200)
  @ApiEnvelope(DriverRideDetailDto)
  complete(
    @CurrentUser() user: JwtClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteDriverRideDto,
  ) {
    return this.rides.complete(id, user.user_id, dto);
  }
}
