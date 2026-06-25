import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { SessionUser } from './auth.service';

/** Marks a route/controller as public — skips the global AuthGuard. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** RBAC roles required for a route (plan §2 / §8.1). */
export const ROLES_KEY = 'roles';
export type Role = 'user' | 'shelter' | 'admin';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Injects the authenticated user attached by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (data: keyof SessionUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user: SessionUser | undefined = req.user;
    return data && user ? user[data] : user;
  },
);
