import { AdminDocumentEditDto } from '../../libs/resources/src/admin/admin-edit.dto.js';
import { AdminReportingService } from '../../libs/resources/src/admin/admin-reporting.service.js';
import { AdminApplicationsQueryDto } from '../../libs/resources/src/admin/admin-query.dto.js';
import { AdminApplicationsPageDto } from '../openapi/admin-response.dto.js';
import { SuspendDriverDto } from '@app/resources/rides/dto/driver-ride.dto.js';
import { DriverProfileDataDto } from '../openapi/response.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  AdminDriverDetailDto,
  DriverReviewedDto,
  DocumentReviewedDto,
} from '../openapi/response.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminDriverService, Roles, RolesGuard } from '@app/resources';
import {
  ReviewDocumentDto,
  ReviewVehicleDto,
  ReviewDriverDto,
} from '@app/resources/drivers/dto/review-driver.dto.js';
import { CurrentUser } from '@app/resources/auth/decorators/current-user.decorator.js';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';

@ApiTags('Admin Drivers')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('admin/drivers')
export class AdminDriversController {
  constructor(
    private readonly adminDriverService: AdminDriverService,
    private readonly reports: AdminReportingService,
  ) {}

  @Get()
  @ApiEnvelope(AdminApplicationsPageDto)
  listDrivers(@Query() query: AdminApplicationsQueryDto) {
    return this.reports.applications(query);
  }

  @Post(':profileId/request-corrections')
  @HttpCode(200)
  @ApiEnvelope(DriverProfileDataDto)
  requestCorrections(
    @CurrentUser() admin: JwtClaims,
    @Param('profileId') id: string,
    @Body() dto: SuspendDriverDto,
  ) {
    return this.adminDriverService.requestCorrections(
      id,
      admin.user_id,
      dto.reason,
      dto.operation_id,
    );
  }

  @Post(':profileId/suspend')
  @HttpCode(200)
  @ApiEnvelope(DriverProfileDataDto)
  suspend(
    @CurrentUser() admin: JwtClaims,
    @Param('profileId') profileId: string,
    @Body() dto: SuspendDriverDto,
  ) {
    return this.adminDriverService.suspend(
      profileId,
      admin.user_id,
      dto.reason,
      dto.operation_id,
    );
  }
  @Post('vehicles/:vehicleId/review')
  @HttpCode(200)
  @ApiEnvelope(DriverProfileDataDto)
  reviewVehicle(
    @CurrentUser() admin: JwtClaims,
    @Param('vehicleId') id: string,
    @Body() dto: ReviewVehicleDto,
  ) {
    return this.adminDriverService.reviewVehicle(id, dto, admin.user_id);
  }

  @Post('vehicle-documents/:documentId/review')
  @HttpCode(200)
  @ApiEnvelope(DocumentReviewedDto)
  reviewVehicleDocument(
    @CurrentUser() admin: JwtClaims,
    @Param('documentId') id: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.adminDriverService.reviewVehicleDocument(
      id,
      dto,
      admin.user_id,
    );
  }

  @Post('documents/:documentId/correct')
  @HttpCode(200)
  @ApiEnvelope(DocumentReviewedDto)
  correctDocument(
    @CurrentUser() actor: JwtClaims,
    @Param('documentId') id: string,
    @Body() dto: AdminDocumentEditDto,
  ) {
    return this.adminDriverService.correctMetadata(
      id,
      false,
      actor.user_id,
      dto,
    );
  }
  @Post('vehicle-documents/:documentId/correct')
  @HttpCode(200)
  @ApiEnvelope(DocumentReviewedDto)
  correctVehicleDocument(
    @CurrentUser() actor: JwtClaims,
    @Param('documentId') id: string,
    @Body() dto: AdminDocumentEditDto,
  ) {
    return this.adminDriverService.correctMetadata(
      id,
      true,
      actor.user_id,
      dto,
    );
  }

  @Get('pending')
  @ApiOperation({ summary: 'List drivers pending verification' })
  @ApiEnvelope(AdminApplicationsPageDto, 200)
  listPending(@Query() query: AdminApplicationsQueryDto) {
    return this.reports.applications({
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      state: 'PENDING_VERIFICATION',
    });
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get full driver onboarding details' })
  @ApiEnvelope(AdminDriverDetailDto, 200)
  getDriverDetails(@Param('profileId') profileId: string) {
    return this.adminDriverService.getDriverDetails(profileId);
  }

  @Post(':profileId/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject driver profile' })
  @ApiEnvelope(DriverReviewedDto, 200)
  reviewProfile(
    @CurrentUser() admin: JwtClaims,
    @Param('profileId') profileId: string,
    @Body() dto: ReviewDriverDto,
  ) {
    return this.adminDriverService.reviewProfile(profileId, admin.user_id, dto);
  }

  @Post('documents/:documentId/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject individual driver document' })
  @ApiEnvelope(DocumentReviewedDto, 200)
  reviewDocument(
    @CurrentUser() admin: JwtClaims,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.adminDriverService.reviewDocument(
      documentId,
      dto,
      admin.user_id,
    );
  }
}
