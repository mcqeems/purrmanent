import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './auth.decorators';
import type { SessionUser } from './auth.service';

/**
 * RBAC guard (plan §2 / §8.1). Runs after AuthGuard.
 *
 * ponytail: the spec schema has no role column yet, so a user's role defaults
 * to 'user'. The mechanism (decorator + guard) is wired so that adding a role
 * claim later is a one-line change — set req.user.role from the DB/session.
 * Upgrade path: add users.role column + map it in AuthService.getSession.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: SessionUser }>();
    const role: Role = (req.user?.role as Role) ?? 'user';
    if (!required.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
