import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Global so AuthService (and the guards) are available app-wide. The better-auth
 * HTTP handler itself is mounted in main.ts (it needs the raw request body, so
 * it sits ahead of the JSON body parser) rather than via a Nest controller.
 *
 * Guard order: AuthGuard (authenticate) then RolesGuard (authorize).
 */
@Global()
@Module({
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
