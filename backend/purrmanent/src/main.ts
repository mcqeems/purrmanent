import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import { AppModule } from './app.module';
import type { Env } from './config/env';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AUTH_INSTANCE, type Auth } from './modules/auth/auth.provider';

async function bootstrap() {
  // bodyParser disabled: the better-auth handler must read the raw request
  // stream, so it is mounted before any JSON body parser (plan §3.2).
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService<Env, true>);

  const prefix = config.get('API_GLOBAL_PREFIX', { infer: true });
  app.setGlobalPrefix(prefix);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.enableCors({
    origin: config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // Mount better-auth catch-all (Express 5 named wildcard) ahead of the JSON
  // parser. The auth instance is an async factory provider (AUTH_INSTANCE),
  // resolved during NestFactory.create(), so it's ready here. better-auth/node
  // is ESM -> dynamic import; its handler is `any` across the ESM boundary, so
  // the unsafe-* rules are disabled for just these glue lines.

  const auth = app.get<Auth>(AUTH_INSTANCE);
  const { toNodeHandler } = await import('better-auth/node');
  const authHandler = toNodeHandler(auth);
  const httpAdapter = app.getHttpAdapter().getInstance() as express.Application;
  // Convenience endpoints (register/login/logout/session) are handled by
  // AuthController (Nest); everything else under /api/auth is better-auth's
  // native handler (incl. Google OAuth at /api/auth/sign-in/social).
  const nestAuthRoutes = new Set([
    `/${prefix}/auth/register`,
    `/${prefix}/auth/login`,
    `/${prefix}/auth/logout`,
    `/${prefix}/auth/session`,
  ]);
  httpAdapter.all(
    '/api/auth/*splat',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (nestAuthRoutes.has(req.path)) return next();
      return authHandler(req, res);
    },
  );

  // JSON / urlencoded body parsing for every *other* route.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI docs at /docs (kept off the /api prefix and /api/auth handler).
  // Built after setGlobalPrefix so operation paths include the prefix;
  // cleanupOpenApiDoc renders the nestjs-zod DTO schemas correctly.
  // OpenAPI docs at /docs — DISABLED in production (NODE_ENV=production).
  // Built after setGlobalPrefix so operation paths include the prefix;
  // cleanupOpenApiDoc renders the nestjs-zod DTO schemas correctly.
  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Purrmanent API')
      .setDescription('Backend API for Purrmanent — the 90-day cat-parent guide.')
      .setVersion('1.0')
      .addCookieAuth('better-auth.session_token')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, () =>
      cleanupOpenApiDoc(SwaggerModule.createDocument(app, swaggerConfig)),
    );
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}
void bootstrap();
