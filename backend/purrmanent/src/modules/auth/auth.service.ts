import { Inject, Injectable } from '@nestjs/common';
import { AUTH_INSTANCE } from './auth.provider';
import type { Auth } from './auth.provider';

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
  constructor(@Inject(AUTH_INSTANCE) private readonly auth: Auth) {}

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
    return this.auth.api.signUpEmail({ body, asResponse: true });
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
}
