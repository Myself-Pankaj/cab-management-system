import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard, VehicleCategoryService } from '@app/resources';
import { UpdateCabCategoryDto } from '@app/resources/rides/dto/ride.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import { VehicleCategoryResponseDto } from '../openapi/response.dto.js';
@ApiTags('Admin Cabs')
@ApiCookieAuth('access_token')
@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('admin/cabs')
export class AdminCabsController {
  constructor(private readonly categories: VehicleCategoryService) {}
  @Get()
  @ApiOperation({ summary: 'List all configurable cab categories' })
  @ApiEnvelope(VehicleCategoryResponseDto, 200, true)
  list() {
    return this.categories.listCategories(true);
  }
  @Put(':category')
  @ApiOperation({ summary: 'Update a cab category' })
  @ApiEnvelope(VehicleCategoryResponseDto, 200)
  update(
    @Param('category') category: string,
    @Body() dto: UpdateCabCategoryDto,
  ) {
    return this.categories.update(category, dto);
  }
}
