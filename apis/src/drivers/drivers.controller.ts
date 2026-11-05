import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  DriverProfileDataDto,
  DriverOnboardingDataDto,
  DocumentCreatedDto,
  DocumentsDataDto,
  BankAccountSavedDto,
  BankAccountDataDto,
  VehicleDataDto,
  VehiclesDataDto,
  VehicleDocumentCreatedDto,
  DriverSubmittedDto,
} from '../openapi/response.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  DriverOnboardingService,
  Roles,
  RolesGuard,
} from '@app/resources';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import { CreateDriverDocumentDto } from '@app/resources/drivers/dto/create-driver-document.dto.js';
import { UpsertBankDetailsDto } from '@app/resources/drivers/dto/upsert-bank-details.dto.js';
import { CreateDriverVehicleDto } from '@app/resources/drivers/dto/create-driver-vehicle.dto.js';
import { CreateVehicleDocumentDto } from '@app/resources/drivers/dto/create-vehicle-document.dto.js';

@ApiTags('Drivers')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Driver')
@Controller('drivers/me')
export class DriversController {
  constructor(
    private readonly driverOnboardingService: DriverOnboardingService,
  ) {}

  @Get('onboarding')
  @ApiOperation({
    summary: 'Get saved onboarding application and completion checklist',
  })
  @ApiEnvelope(DriverOnboardingDataDto, 200)
  getOnboarding(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.getOnboarding(user.user_id);
  }

  @Patch('documents/:documentId')
  @ApiOperation({ summary: 'Update a saved driver document' })
  @ApiEnvelope(DocumentCreatedDto, 200)
  updateDocument(
    @CurrentUser() user: JwtClaims,
    @Param('documentId') id: string,
    @Body() dto: CreateDriverDocumentDto,
  ) {
    return this.driverOnboardingService.addDocument(user.user_id, dto, id);
  }

  @Patch('vehicles/:vehicleId')
  @ApiOperation({ summary: 'Update a saved vehicle' })
  @ApiEnvelope(VehicleDataDto, 200)
  updateVehicle(
    @CurrentUser() user: JwtClaims,
    @Param('vehicleId') id: string,
    @Body() dto: CreateDriverVehicleDto,
  ) {
    return this.driverOnboardingService.addVehicle(user.user_id, dto, id);
  }

  @Patch('vehicles/:vehicleId/documents/:documentId')
  @ApiOperation({ summary: 'Update a saved vehicle document' })
  @ApiEnvelope(VehicleDocumentCreatedDto, 200)
  updateVehicleDocument(
    @CurrentUser() user: JwtClaims,
    @Param('vehicleId') vehicleId: string,
    @Param('documentId') documentId: string,
    @Body() dto: CreateVehicleDocumentDto,
  ) {
    return this.driverOnboardingService.addVehicleDocument(
      user.user_id,
      vehicleId,
      dto,
      documentId,
    );
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current driver profile' })
  @ApiEnvelope(DriverProfileDataDto, 200)
  getProfile(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.getMyProfile(user.user_id);
  }

  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create driver document record (attach image via /media)',
  })
  @ApiEnvelope(DocumentCreatedDto, 201)
  addDocument(
    @CurrentUser() user: JwtClaims,
    @Body() dto: CreateDriverDocumentDto,
  ) {
    return this.driverOnboardingService.addDocument(user.user_id, dto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'List driver documents with linked images' })
  @ApiEnvelope(DocumentsDataDto, 200)
  listDocuments(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.listDocuments(user.user_id);
  }

  @Put('bank-details')
  @ApiOperation({ summary: 'Upsert driver bank account' })
  @ApiEnvelope(BankAccountSavedDto, 200)
  upsertBankDetails(
    @CurrentUser() user: JwtClaims,
    @Body() dto: UpsertBankDetailsDto,
  ) {
    return this.driverOnboardingService.upsertBankDetails(user.user_id, dto);
  }

  @Get('bank-details')
  @ApiOperation({ summary: 'Get driver bank account' })
  @ApiEnvelope(BankAccountDataDto, 200)
  getBankDetails(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.getBankDetails(user.user_id);
  }

  @Post('vehicles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register driver vehicle' })
  @ApiEnvelope(VehicleDataDto, 201)
  addVehicle(
    @CurrentUser() user: JwtClaims,
    @Body() dto: CreateDriverVehicleDto,
  ) {
    return this.driverOnboardingService.addVehicle(user.user_id, dto);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List driver vehicles with linked images' })
  @ApiEnvelope(VehiclesDataDto, 200)
  listVehicles(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.listVehicles(user.user_id);
  }

  @Post('vehicles/:vehicleId/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create vehicle document record (attach image via /media)',
  })
  @ApiEnvelope(VehicleDocumentCreatedDto, 201)
  addVehicleDocument(
    @CurrentUser() user: JwtClaims,
    @Param('vehicleId') vehicleId: string,
    @Body() dto: CreateVehicleDocumentDto,
  ) {
    return this.driverOnboardingService.addVehicleDocument(
      user.user_id,
      vehicleId,
      dto,
    );
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit driver profile for admin verification' })
  @ApiEnvelope(DriverSubmittedDto, 200)
  submit(@CurrentUser() user: JwtClaims) {
    return this.driverOnboardingService.submitForVerification(user.user_id);
  }
}
