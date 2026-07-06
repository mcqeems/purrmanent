import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Env } from '../../config/env';
import { IS_PUBLIC_KEY } from './auth.decorators';

/**
 * CSRF protection guard. Applies two complementary defenses:
 *
 * 1. X-Requested-With header — simple HTML forms cannot set custom headers,
 *    so its presence proves the request came from JavaScript (our frontend).
 * 2. Origin/Referer validation — browsers always send Origin or Referer on
 *    cross-origin POST requests; validates against FRONTEND_ORIGINS allowlist.
 *
 * Either defense passing is sufficient (OR logic). This provides defense-in-depth
 * while not breaking legitimate API clients.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 * Public routes (decorated with @Public()) are also exempt.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigins: Set<string>;
  private readonly safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly reflector: Reflector,
  ) {
    const origins = this.config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim());
    const backendUrl = this.config.get('BETTER_AUTH_URL', { infer: true });
    this.allowedOrigins = new Set([...origins, backendUrl]);
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();

    if (this.safeMethods.has(method)) return true;

    // Defense 1: X-Requested-With header (simple forms can't set this)
    const requestedWith = req.headers['x-requested-with'];
    if (requestedWith) return true;

    // Defense 2: Origin/Referer validation (browsers always send these on POST)
    const origin = this.extractOrigin(req);
    if (origin && this.allowedOrigins.has(origin)) return true;

    throw new ForbiddenException(
      'CSRF validation failed: missing X-Requested-With header and origin not allowed',
    );
  }

  private extractOrigin(req: Request): string | null {
    const origin = req.headers.origin;
    if (origin) return origin;

    const referer = req.headers.referer;
    if (referer) {
      try {
        return new URL(referer).origin;
      } catch {
        return null;
      }
    }
    return null;
  }
}
