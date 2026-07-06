import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CsrfGuard } from './csrf.guard';
import { authInstanceProvider, AUTH_INSTANCE } from './auth.provider';
import { AuthController } from './auth.controller';

/**
 * Global so AuthService (and the guard) are available app-wide. The better-auth
 * HTTP handler itself is mounted in main.ts (it needs the raw request body, so
 * it sits ahead of the JSON body parser) rather than via a Nest controller.
 *
 * AUTH_INSTANCE is an async factory provider — resolved during
 * NestFactory.create(), so main.ts can read it before app.listen().
 *
 * Guards are applied in registration order: CsrfGuard runs first (validates
 * Origin/Referer + X-Requested-With for state-changing requests), then
 * AuthGuard (validates session). Both respect @Public() routes.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    authInstanceProvider,
    AuthService,
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, AUTH_INSTANCE],
})
export class AuthModule {}
