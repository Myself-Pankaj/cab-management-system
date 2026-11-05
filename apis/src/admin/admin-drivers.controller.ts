import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  PendingDriversDto,
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
  constructor(private readonly adminDriverService: AdminDriverService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List drivers pending verification' })
  @ApiEnvelope(PendingDriversDto, 200)
  listPending() {
    return this.adminDriverService.listPending();
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
    @Param('documentId') documentId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.adminDriverService.reviewDocument(documentId, dto);
  }
}
