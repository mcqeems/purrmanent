import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { Resend } from 'resend';
import type { betterAuth } from 'better-auth';
import type { Env } from '../../config/env';

type Auth = ReturnType<typeof betterAuth>;

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
}

/**
 * Owns the better-auth instance (plan §2 / §3.2). better-auth is ESM-only, so
 * it is loaded via dynamic import() inside an async lifecycle hook (the project
 * compiles to CommonJS).
 *
 * Schema: better-auth manages users/user_sessions/accounts/verifications with
 * integer ids (useNumberId) so the rest of the app's integer FKs line up.
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private auth!: Auth;
  private pool!: Pool;

  constructor(private readonly config: ConfigService<Env, true>) {}

  get instance(): Auth {
    return this.auth;
  }

  async onModuleInit(): Promise<void> {
    const { betterAuth } = await import('better-auth');

    this.pool = new Pool({
      connectionString: this.config.get('DATABASE_URL', { infer: true }),
    });

    const origins = this.config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim());
    const baseURL = this.config.get('BETTER_AUTH_URL', { infer: true });
    const cookieDomain = this.config.get('COOKIE_DOMAIN', { infer: true });
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';

    const resendKey = this.config.get('RESEND_API_KEY', { infer: true });
    const resend = resendKey ? new Resend(resendKey) : null;
    const sendEmail = async (to: string, subject: string, html: string) => {
      if (!resend) {
        this.logger.warn(`RESEND_API_KEY unset — skipping email "${subject}" to ${to}`);
        return;
      }
      await resend.emails.send({
        from: 'Purrmanent <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
    };

    const googleId = this.config.get('GOOGLE_CLIENT_ID', { infer: true });
    const googleSecret = this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });

    const options = {
      database: this.pool,
      secret: this.config.get('BETTER_AUTH_SECRET', { infer: true }),
      baseURL,
      basePath: '/api/auth',
      trustedOrigins: [...origins, baseURL],
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
          await sendEmail(
            user.email,
            'Reset your Purrmanent password',
            `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
          );
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
          await sendEmail(
            user.email,
            'Verify your Purrmanent email',
            `<p>Welcome to Purrmanent! Verify your email <a href="${url}">here</a>.</p>`,
          );
        },
      },
      ...(googleId && googleSecret
        ? {
            socialProviders: {
              google: { clientId: googleId, clientSecret: googleSecret },
            },
          }
        : {}),
      user: {
        modelName: 'users',
        additionalFields: {
          points: { type: 'number', defaultValue: 0, input: false },
          timezone: { type: 'string', defaultValue: 'Asia/Jakarta', input: false },
          preferredLanguage: { type: 'string', defaultValue: 'en', input: false },
          lastLoginAt: { type: 'date', required: false, input: false },
        },
      },
      session: {
        modelName: 'user_sessions',
        expiresIn: 60 * 60 * 24 * 30, // 30 days (plan §2.7)
        updateAge: 60 * 60 * 24, // refresh daily
      },
      account: { modelName: 'accounts' },
      verification: { modelName: 'verifications' },
      advanced: {
        database: { useNumberId: true },
        ...(cookieDomain
          ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
          : {}),
        defaultCookieAttributes: {
          sameSite: isProd ? ('none' as const) : ('lax' as const),
          secure: isProd,
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.auth = betterAuth(options as any);
    this.logger.log('better-auth initialized');
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
