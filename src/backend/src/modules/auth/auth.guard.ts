import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import type { SessionUser } from './auth.service';
import { IS_PUBLIC_KEY } from './auth.decorators';

/**
 * Global guard (registered as APP_GUARD). Resolves the better-auth session from
 * the request (cookie or bearer — better-auth handles both) and attaches
 * req.user. Routes decorated with @Public() are skipped.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      user?: SessionUser;
      headers: Record<string, string | string[] | undefined>;
    }>();
    const session = await this.auth.getSession(req.headers);
    if (!session?.user) {
      throw new UnauthorizedException('Authentication required');
    }
    req.user = session.user;
    return true;
  }
}
