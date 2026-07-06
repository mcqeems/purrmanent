import { Inject, Injectable, BadRequestException } from '@nestjs/common';
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

  /** All configured frontend origins — allowlist for callback URL validation. */
  private get allowedOrigins(): string[] {
    return this.config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim());
  }

  /**
   * Validate that a callback URL's origin is in the FRONTEND_ORIGINS allowlist.
   * This prevents open-redirect attacks where an attacker supplies a malicious
   * callback URL to redirect users after email verification.
   *
   * @param callbackURL - The URL to validate
   * @returns The validated URL if it matches an allowed origin
   * @throws BadRequestException if the URL's origin is not in the allowlist
   */
  private validateCallbackURL(callbackURL: string): string {
    let parsedURL: URL;
    try {
      parsedURL = new URL(callbackURL);
    } catch {
      throw new BadRequestException(
        'callbackURL must be a valid absolute URL',
      );
    }

    const urlOrigin = parsedURL.origin;
    const allowed = this.allowedOrigins;

    // Check if the URL's origin matches any allowed origin
    if (!allowed.includes(urlOrigin)) {
      throw new BadRequestException(
        `callbackURL origin "${urlOrigin}" is not in the allowlist. Allowed origins: ${allowed.join(', ')}`,
      );
    }

    return callbackURL;
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
    const u = result.user as unknown as SessionUser;
    // better-auth returns the id as a string; the DB uses integer ids, so
    // normalize here. Otherwise strict comparisons (e.g. event.userId !==
    // userId) fail with 5 !== "5".
    return { user: { ...u, id: Number(u.id) } };
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
   * link expired can request a new one.
   *
   * The callbackURL is validated against the FRONTEND_ORIGINS allowlist to
   * prevent open-redirect attacks.
   */
  sendVerificationEmail(body: {
    email: string;
    callbackURL?: string;
  }): Promise<Response> {
    // Validate the callback URL if provided, otherwise use the default frontend origin
    const validatedCallbackURL = body.callbackURL
      ? this.validateCallbackURL(body.callbackURL)
      : this.frontendOrigin;

    return this.auth.api.sendVerificationEmail({
      body: {
        email: body.email,
        callbackURL: validatedCallbackURL,
      },
      asResponse: true,
    });
  }
}
