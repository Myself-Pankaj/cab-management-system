import { LocationSearchDto } from '@app/resources/maps/location-search.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  LocationSuggestionDto,
  VehicleCategoryResponseDto,
  RideQuoteResponseDto,
  RideDetailDto,
  RidesDataDto,
  OnlinePaymentDto,
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
  MapsService,
  CurrentUser,
  Roles,
  RolesGuard,
  RideBookingService,
  RideQuoteService,
  VehicleCategoryService,
} from '@app/resources';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import {
  CreateRideDto,
  ListRidesQueryDto,
  RideQuoteDto,
} from '@app/resources/rides/dto/ride.dto.js';
import type { ride_status } from '@db/queries/rides/rides.queries.js';

@ApiTags('Rides')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Passenger')
@Controller('rides')
export class RidesController {
  constructor(
    private readonly mapsService: MapsService,
    private readonly vehicleCategoryService: VehicleCategoryService,
    private readonly rideQuoteService: RideQuoteService,
    private readonly rideBookingService: RideBookingService,
  ) {}

  @Get('locations')
  @ApiOperation({ summary: 'Autocomplete locations in India using ORS' })
  @ApiEnvelope(LocationSuggestionDto, 200, true)
  locations(@Query() query: LocationSearchDto) {
    return this.mapsService.autocomplete(query.text.trim());
  }

  @Get('vehicle-categories')
  @ApiOperation({ summary: 'List active vehicle categories and fare rates' })
  @ApiEnvelope(VehicleCategoryResponseDto, 200, true)
  listVehicleCategories() {
    return this.vehicleCategoryService.listCategories();
  }

  @Post('quote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get fare quote for a ride' })
  @ApiEnvelope(RideQuoteResponseDto, 200)
  quote(@Body() dto: RideQuoteDto) {
    return this.rideQuoteService.quote(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a ride booking' })
  @ApiEnvelope(RideDetailDto, 201)
  create(@CurrentUser() user: JwtClaims, @Body() dto: CreateRideDto) {
    return this.rideBookingService.createRide(user.user_id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'List rides booked by current user' })
  @ApiEnvelope(RidesDataDto, 200)
  listMine(@CurrentUser() user: JwtClaims, @Query() query: ListRidesQueryDto) {
    return this.rideBookingService.listMyRides(
      user.user_id,
      query.status as ride_status | undefined,
      query.limit ?? 20,
      query.offset ?? 0,
    );
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Get ride detail for current booker' })
  @ApiEnvelope(RideDetailDto, 200)
  getMine(@CurrentUser() user: JwtClaims, @Param('id') id: string) {
    return this.rideBookingService.getRideDetailForBooker(user.user_id, id);
  }

  @Post(':id/pay-online')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay order for pending online payment' })
  @ApiEnvelope(OnlinePaymentDto, 200)
  payOnline(@CurrentUser() user: JwtClaims, @Param('id') id: string) {
    return this.rideBookingService.payOnline(user.user_id, id);
  }
}
