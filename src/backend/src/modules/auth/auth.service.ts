import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { AUTH_INSTANCE, AUTH_POOL } from './auth.provider';
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
    @Inject(AUTH_POOL) private readonly pool: Pool,
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
    try {
      const result = await this.auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });
      if (result?.user) {
        const u = result.user as unknown as SessionUser;
        return { user: { ...u, id: Number(u.id) } };
      }
    } catch {}

    // Fallback for Mobile Bearer / Cookie Token lookup in user_sessions
    const authHeader = headers['authorization'] || headers['Authorization'];
    const cookieHeader = headers['cookie'] || headers['Cookie'];

    let token: string | undefined;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (typeof cookieHeader === 'string') {
      const match = cookieHeader.match(/(?:better-auth\.session_token|session_token)=([^;]+)/);
      if (match) token = match[1];
    }

    if (token && this.pool) {
      try {
        const sessionResult = await this.pool.query(
          'SELECT s.*, u.email, u.name, u.image, u."emailVerified" FROM user_sessions s JOIN users u ON s."userId" = u.id WHERE s.token = $1 AND s."expiresAt" > NOW()',
          [token],
        );
        if (sessionResult.rows.length > 0) {
          const row = sessionResult.rows[0];
          return {
            user: {
              id: Number(row.userId),
              email: row.email,
              name: row.name || row.email.split('@')[0],
              image: row.image || null,
              emailVerified: row.emailVerified ?? true,
            },
          };
        }
      } catch {}
    }

    return null;
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

  signInSocial(body: {
    provider: string;
    callbackURL?: string;
  }): Promise<Response> {
    return this.auth.api.signInSocial({ body, asResponse: true });
  }

  async signInGoogleIdToken(idToken: string): Promise<Response> {
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!googleRes.ok) {
      throw new BadRequestException('Invalid Google ID Token');
    }
    const payload = (await googleRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (!payload.email || !payload.sub) {
      throw new BadRequestException('Google ID Token missing email or sub');
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const image = payload.picture || null;

    let userResult = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    let user = userResult.rows[0];

    if (!user) {
      const insertResult = await this.pool.query(
        'INSERT INTO users (email, name, image, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING *',
        [email, name, image],
      );
      user = insertResult.rows[0];
    }

    const accountResult = await this.pool.query(
      'SELECT * FROM accounts WHERE "userId" = $1 AND "providerId" = $2',
      [user.id, 'google'],
    );
    if (accountResult.rows.length === 0) {
      await this.pool.query(
        'INSERT INTO accounts ("userId", "accountId", "providerId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
        [user.id, payload.sub, 'google'],
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.pool.query(
      'INSERT INTO user_sessions ("userId", "token", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
      [user.id, token, expiresAt],
    );

    const bodyData = {
      accessToken: token,
      refreshToken: token,
      token,
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };

    return new Response(JSON.stringify(bodyData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `better-auth.session_token=${token}; Path=/; HttpOnly; SameSite=Lax`,
      },
    });
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
