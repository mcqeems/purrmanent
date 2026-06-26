import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_INSTANCE } from './auth.provider';
import type { Auth } from './auth.provider';
import type { Env } from '../../config/env';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
}

/**
 * Thin accessor around the better-auth instance (built by authInstanceProvider,
 * resolved during NestFactory.create() so it's ready for main.ts to mount).
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_INSTANCE) private readonly auth: Auth,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** First configured frontend origin — sensible default for redirect targets. */
  private get frontendOrigin(): string {
    return this.config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')[0]
      .trim();
  }

  get instance(): Auth {
    return this.auth;
  }

  /** Resolve the active session from raw Node request headers (used by guards). */
  async getSession(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ user: SessionUser } | null> {
    const { fromNodeHeaders } = await import('better-auth/node');
    const result = await this.auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });
    if (!result?.user) return null;
    return result as unknown as { user: SessionUser };
  }

  /**
   * Manual email/password endpoints proxy to better-auth's server API with
   * `asResponse: true`, returning a web Response (status + Set-Cookie + body)
   * that the controller forwards to the Express response. This keeps a single
   * source of truth (better-auth) while exposing clean, documented routes
   * alongside Google OAuth.
   */
  signUpEmail(body: {
    email: string;
    password: string;
    name: string;
  }): Promise<Response> {
    return this.auth.api.signUpEmail({
      // callbackURL drives where the on-signup verification email link redirects
      // after verifying — send it to the app, not the API.
      body: { ...body, callbackURL: this.frontendOrigin },
      asResponse: true,
    });
  }

  signInEmail(body: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<Response> {
    return this.auth.api.signInEmail({ body, asResponse: true });
  }

  async signOut(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<Response> {
    const { fromNodeHeaders } = await import('better-auth/node');
    return this.auth.api.signOut({
      headers: fromNodeHeaders(headers),
      asResponse: true,
    });
  }

  /**
   * (Re)send a verification email. better-auth issues a fresh, time-limited
   * token (emailVerification.expiresIn = 24h) each call, so a user whose first
   * link expired can request a new one (spec §2.7).
   */
  sendVerificationEmail(body: {
    email: string;
    callbackURL?: string;
  }): Promise<Response> {
    return this.auth.api.sendVerificationEmail({
      // default to the frontend origin (not the API root) so the post-verify
      // redirect lands on the app, not on this backend.
      body: {
        email: body.email,
        callbackURL: body.callbackURL ?? this.frontendOrigin,
      },
      asResponse: true,
    });
  }
}
