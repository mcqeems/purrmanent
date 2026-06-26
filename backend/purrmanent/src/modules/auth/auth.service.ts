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
}
