import { writeFile } from 'node:fs/promises';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { AppLogger } from '@app/core/logger/logger.service.js';
import { AppConfigService } from '@app/core/config/config.service.js';
import { GlobalExceptionFilter } from '@app/core/filter/global.filter.js';
import { ResponseInterceptor } from '@app/core/interceptor/response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableShutdownHooks();

  // Logger
  const logger = app.get(AppLogger);
  logger.forContext('Bootstrap');
  app.useLogger(logger);

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());

  const configService = app.get(AppConfigService);
  app.enableCors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (configService.appConfig.allowedOrigin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  const exportIndex = process.argv.indexOf('--export-openapi');
  if (!configService.isProduction || exportIndex !== -1) {
    const swaggerPath = 'swagger';
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Cab Management API')
      .setDescription('Cab management system API')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .addCookieAuth('refresh_token')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    if (exportIndex !== -1) {
      const output = process.argv[exportIndex + 1];
      if (!output) throw new Error('--export-openapi requires an output path');
      await writeFile(output, JSON.stringify(document, null, 2) + '\n');
      await app.close();
      return;
    }
    SwaggerModule.setup(swaggerPath, app, document, {
      useGlobalPrefix: true,
      jsonDocumentUrl: 'swagger-json',
    });

    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get(
      `/${swaggerPath}`,
      (_req: unknown, res: { redirect: (url: string) => void }) => {
        res.redirect(`/${globalPrefix}/${swaggerPath}`);
      },
    );
  }

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter(logger, configService));
  app.useGlobalInterceptors(new ResponseInterceptor(configService, logger));
  const port = configService.appConfig.port;
  const host = configService.appConfig.host;
  await app.listen(port, host);

  logger.log(
    `✓ Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  if (!configService.isProduction) {
    logger.log(
      `✓ Swagger docs: http://localhost:${port}/${globalPrefix}/swagger`,
    );
  }
}

void bootstrap();
