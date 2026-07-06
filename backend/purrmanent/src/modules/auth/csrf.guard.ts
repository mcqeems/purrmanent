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
 * CSRF protection guard. Validates Origin/Referer headers for state-changing
 * requests (POST, PUT, PATCH, DELETE) to prevent cross-site request forgery.
 * 
 * This guard is necessary because:
 * - Production cookies use SameSite=None (for cross-subdomain support)
 * - express.urlencoded is enabled (allows simple HTML form submissions)
 * - Without this guard, attackers can forge requests from malicious sites
 * 
 * Safe methods (GET, HEAD, OPTIONS) are allowed through without validation.
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
    // Parse allowed origins from config (same as CORS configuration)
    const origins = this.config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim());
    
    // Also allow the backend's own origin for API-to-API calls
    const backendUrl = this.config.get('BETTER_AUTH_URL', { infer: true });
    
    this.allowedOrigins = new Set([...origins, backendUrl]);
  }

  canActivate(context: ExecutionContext): boolean {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();

    // Safe methods don't need CSRF protection
    if (this.safeMethods.has(method)) return true;

    // For state-changing methods, validate Origin or Referer
    const origin = this.extractOrigin(req);
    
    if (!origin) {
      throw new ForbiddenException(
        'CSRF validation failed: missing Origin and Referer headers',
      );
    }

    if (!this.allowedOrigins.has(origin)) {
      throw new ForbiddenException(
        `CSRF validation failed: origin '${origin}' not allowed`,
      );
    }

    return true;
  }

  /**
   * Extract the origin from the request. Prefers the Origin header (sent by
   * browsers on POST/PUT/DELETE), falls back to Referer if Origin is missing
   * (some older clients or non-browser tools).
   */
  private extractOrigin(req: Request): string | null {
    // Origin header (preferred, sent by modern browsers on cross-origin requests)
    const origin = req.headers.origin;
    if (origin) {
      return origin;
    }

    // Referer fallback (extract origin from full URL)
    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        return url.origin;
      } catch {
        // Invalid referer URL
        return null;
      }
    }

    return null;
  }
}
