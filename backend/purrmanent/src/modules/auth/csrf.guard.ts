import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorators';

/**
 * CSRF protection guard for state-changing operations.
 *
 * Mitigates cross-site form POST attacks by requiring a custom header
 * (`X-Requested-With: XMLHttpRequest`) on all non-GET requests. Simple HTML
 * forms cannot set custom headers, and CORS blocks cross-origin JavaScript
 * from setting headers unless the origin is explicitly allowed.
 *
 * Applied globally (registered as APP_GUARD). Routes decorated with @Public()
 * are skipped (auth routes handle CSRF via better-auth's own mechanisms).
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed per RFC 7231 — they
 * must not have side effects.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  private readonly REQUIRED_HEADER = 'x-requested-with';

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      method: string;
      headers: Record<string, string | string[] | undefined>;
    }>();

    // Safe methods (GET, HEAD, OPTIONS) are exempt from CSRF checks.
    if (this.SAFE_METHODS.has(req.method.toUpperCase())) {
      return true;
    }

    // State-changing methods (POST, PUT, PATCH, DELETE) require the header.
    const headerValue = req.headers[this.REQUIRED_HEADER];
    if (!headerValue) {
      throw new ForbiddenException(
        'CSRF protection: X-Requested-With header required for state-changing requests',
      );
    }

    return true;
  }
}
