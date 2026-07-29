import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CsrfGuard } from './csrf.guard';
import { authInstanceProvider, authPoolProvider, AUTH_INSTANCE, AUTH_POOL } from './auth.provider';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    authPoolProvider,
    authInstanceProvider,
    AuthService,
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, AUTH_INSTANCE, AUTH_POOL],
})
export class AuthModule {}
