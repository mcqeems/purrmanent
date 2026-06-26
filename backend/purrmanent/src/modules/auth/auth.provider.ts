import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { Resend } from 'resend';
import type { betterAuth } from 'better-auth';
import type { Env } from '../../config/env';

export type Auth = ReturnType<typeof betterAuth>;

/** DI token for the resolved better-auth instance. */
export const AUTH_INSTANCE = 'AUTH_INSTANCE';

/**
 * Async factory that builds the better-auth instance (plan §2 / §3.2).
 *
 * Why a factory (not onModuleInit): async providers are resolved during
 * `NestFactory.create()`, so the instance exists when main.ts reads it to mount
 * the handler — onModuleInit only runs later during app.init()/listen().
 *
 * better-auth is ESM-only -> dynamic import(); the project compiles to CJS.
 * Schema: better-auth owns users/user_sessions/accounts/verifications with
 * integer ids (useNumberId) so the app's integer FKs line up.
 */
export const authInstanceProvider: Provider = {
  provide: AUTH_INSTANCE,
  inject: [ConfigService],
  useFactory: async (config: ConfigService<Env, true>): Promise<Auth> => {
    const logger = new Logger('AuthInstance');
    const { betterAuth } = await import('better-auth');

    const pool = new Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });

    const origins = config
      .get('FRONTEND_ORIGINS', { infer: true })
      .split(',')
      .map((o) => o.trim());
    const baseURL = config.get('BETTER_AUTH_URL', { infer: true });
    const cookieDomain = config.get('COOKIE_DOMAIN', { infer: true });
    const isProd = config.get('NODE_ENV', { infer: true }) === 'production';

    const resendKey = config.get('RESEND_API_KEY', { infer: true });
    const resend = resendKey ? new Resend(resendKey) : null;
    const sendEmail = async (to: string, subject: string, html: string) => {
      if (!resend) {
        logger.warn(
          `RESEND_API_KEY unset — skipping email "${subject}" to ${to}`,
        );
        return;
      }
      await resend.emails.send({
        from: 'Purrmanent <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
    };

    const googleId = config.get('GOOGLE_CLIENT_ID', { infer: true });
    const googleSecret = config.get('GOOGLE_CLIENT_SECRET', { infer: true });

    const options = {
      database: pool,
      secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
      baseURL,
      basePath: '/api/auth',
      trustedOrigins: [...origins, baseURL],
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        sendResetPassword: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
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
        sendVerificationEmail: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
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
          timezone: {
            type: 'string',
            defaultValue: 'Asia/Jakarta',
            input: false,
          },
          preferredLanguage: {
            type: 'string',
            defaultValue: 'en',
            input: false,
          },
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
      // Auth routes are mounted on express ahead of Nest guards, so they are
      // rate-limited by better-auth itself (plan §2.7 / §8.4).
      rateLimit: {
        enabled: true,
        window: 60,
        max: 20,
        customRules: {
          '/sign-in/email': { window: 3600, max: 5 },
          '/sign-up/email': { window: 3600, max: 5 },
          '/forget-password': { window: 3600, max: 5 },
        },
      },
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

    const auth = betterAuth(options as any);
    logger.log('better-auth initialized');
    return auth;
  },
};
