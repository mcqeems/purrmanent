import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import express from 'express';
import { AppModule } from './app.module';
import type { Env } from './config/env';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  // bodyParser disabled: the better-auth handler must read the raw request
  // stream, so it is mounted before any JSON body parser (plan §3.2).
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix(config.get('API_GLOBAL_PREFIX', { infer: true }));

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.enableCors({
    origin: config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // Mount better-auth catch-all (Express 5 named wildcard) ahead of the JSON
  // parser. better-auth/node is ESM -> dynamic import.
  const auth = app.get(AuthService).instance;
  const { toNodeHandler } = await import('better-auth/node');
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.all('/api/auth/*splat', toNodeHandler(auth));

  // JSON / urlencoded body parsing for every *other* route.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}
void bootstrap();
