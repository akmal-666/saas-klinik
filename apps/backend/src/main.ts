import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Use require for CJS-compatible middleware
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);

  // ─── Security ──────────────────────────────────────────
  app.use(helmet.default ? helmet.default() : helmet());
  app.use(compression());

  // ─── CORS ──────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000',
      config.get('NEXT_PUBLIC_URL') ?? 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-clinic-id'],
  });

  // ─── API Versioning ────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ─── Global Pipes ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters ────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Interceptors ───────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ─── Swagger (dev only) ────────────────────────────────
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Klinik SaaS API')
      .setDescription('Clinic Management System REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`🚀 Backend: http://localhost:${port}/api`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
