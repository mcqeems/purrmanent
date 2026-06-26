import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { authInstanceProvider, AUTH_INSTANCE } from './auth.provider';

/**
 * Global so AuthService (and the guards) are available app-wide. The better-auth
 * HTTP handler itself is mounted in main.ts (it needs the raw request body, so
 * it sits ahead of the JSON body parser) rather than via a Nest controller.
 *
 * AUTH_INSTANCE is an async factory provider — resolved during
 * NestFactory.create(), so main.ts can read it before app.listen().
 *
 * Guard order: AuthGuard (authenticate) then RolesGuard (authorize).
 */
@Global()
@Module({
  providers: [
    authInstanceProvider,
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService, AUTH_INSTANCE],
})
export class AuthModule {}
