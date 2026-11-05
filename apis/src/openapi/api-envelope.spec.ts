import 'reflect-metadata';
import { Controller, Get, Module, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
  type SchemaObject,
} from '@nestjs/swagger';
import { ApiEnvelope } from './api-envelope.decorator.js';
import {
  AdminDriverDetailDto,
  AuthSessionResponseDto,
  RideDetailDto,
  VehicleCategoryResponseDto,
} from './response.dto.js';

@Controller('contracts')
class ContractController {
  @Get('session')
  @ApiEnvelope(AuthSessionResponseDto)
  session() {
    return {};
  }
  @Get('driver')
  @ApiEnvelope(AdminDriverDetailDto)
  driver() {
    return {};
  }
  @Get('ride')
  @ApiEnvelope(RideDetailDto)
  ride() {
    return {};
  }
  @Get('categories')
  @ApiEnvelope(VehicleCategoryResponseDto, 200, true)
  categories() {
    return [{ category: 'SEATER_4' }];
  }
}
@Module({ controllers: [ContractController] })
class ContractModule {}

describe('OpenAPI response contracts', () => {
  let app: INestApplication;
  let document: OpenAPIObject;
  beforeAll(async () => {
    app = await NestFactory.create(ContractModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    document = SwaggerModule.createDocument(app, new DocumentBuilder().build());
  });
  afterAll(async () => {
    await app.close();
  });
  it('preserves nested models, enums, nullable values and serialized dates', () => {
    const schemas = document.components?.schemas as Record<
      string,
      SchemaObject
    >;
    expect(schemas.AuthSessionResponseDto.required).not.toContain(
      'refresh_token',
    );
    expect(schemas.UserResponseDto.properties?.global_role).toMatchObject({
      nullable: true,
      enum: ['Admin', 'Driver', 'Passenger'],
    });
    expect(schemas.UserResponseDto.properties?.created_at).toMatchObject({
      type: 'string',
      format: 'date-time',
    });
    expect(schemas.AdminDriverDetailDto.properties?.vehicles).toMatchObject({
      type: 'array',
      items: { $ref: '#/components/schemas/AdminVehicleDto' },
    });
    expect(schemas.RideDetailDto.properties?.payments).toMatchObject({
      type: 'array',
      items: { $ref: '#/components/schemas/PaymentResponseDto' },
    });
    expect(schemas.RideResponseDto.properties?.final_fare).toMatchObject({
      type: 'number',
      nullable: true,
    });
    expect(schemas.RideResponseDto.properties?.return_at).toMatchObject({
      type: 'string',
      format: 'date-time',
      nullable: true,
    });
    expect(schemas.AdminVehicleDto.required).toContain('manufacturing_year');
  });
  it('documents the interceptor envelope and array data without changing the handler', () => {
    const response =
      document.paths['/api/v1/contracts/categories'].get?.responses['200'];
    if (!response || !('content' in response))
      throw new Error('Missing response');
    const schema = response.content?.['application/json']
      .schema as SchemaObject;
    expect(schema.required).toEqual([
      'success',
      'message',
      'data',
      'timestamp',
      'path',
    ]);
    expect(schema.properties?.data).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/VehicleCategoryResponseDto' },
    });
    expect(new ContractController().categories()).toEqual([
      { category: 'SEATER_4' },
    ]);
  });
});
