import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { SessionUser } from './auth.service';

/** Marks a route/controller as public — skips the global AuthGuard. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Injects the authenticated user attached by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (data: keyof SessionUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user?: SessionUser }>();
    const user = req.user;
    return data && user ? user[data] : user;
  },
);
