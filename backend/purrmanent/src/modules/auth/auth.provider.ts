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
    const mailFrom = config.get('MAIL_FROM', { infer: true });
    const resend = resendKey ? new Resend(resendKey) : null;
    const sendEmail = async (
      to: string,
      subject: string,
      html: string,
      text: string,
    ) => {
      if (!resend) {
        logger.warn(
          `RESEND_API_KEY unset — skipping email "${subject}" to ${to}`,
        );
        return;
      }
      // Resend does NOT throw on API errors — it returns { data, error }.
      // Surface the error so delivery failures (e.g. test-mode recipient
      // restriction, unverified domain) are visible instead of silent.
      const { data, error } = await resend.emails.send({
        from: mailFrom,
        to,
        subject,
        html,
        // a plain-text alternative materially improves inbox placement
        text,
        headers: { 'List-Unsubscribe': `<${baseURL}>` },
      });
      if (error) {
        logger.error(
          `Email "${subject}" to ${to} failed: ${error.name} — ${error.message}`,
        );
      } else {
        logger.log(`Email "${subject}" sent to ${to} (id ${data?.id})`);
      }
    };

    /**
     * Build a branded HTML + matching plain-text body. Showing the real URL as
     * text (not just a "click here" link) and shipping a text/plain part are
     * both strong anti-spam signals.
     */
    const buildEmail = (opts: {
      heading: string;
      intro: string;
      buttonLabel: string;
      url: string;
      note: string;
    }): { html: string; text: string } => {
      const html = `<!doctype html>
<html><body style="margin:0;background:#faf7f2;font-family:Nunito,Arial,sans-serif;color:#3a3a3a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px">
        <tr><td style="font-size:20px;font-weight:700;color:#e07a5f">Purrmanent</td></tr>
        <tr><td style="padding-top:16px;font-size:18px;font-weight:700">${opts.heading}</td></tr>
        <tr><td style="padding-top:8px;font-size:15px;line-height:1.5">${opts.intro}</td></tr>
        <tr><td style="padding:24px 0">
          <a href="${opts.url}" style="background:#e07a5f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block">${opts.buttonLabel}</a>
        </td></tr>
        <tr><td style="font-size:13px;color:#777;line-height:1.5">If the button doesn't work, copy and paste this link into your browser:<br><span style="color:#555;word-break:break-all">${opts.url}</span></td></tr>
        <tr><td style="padding-top:16px;font-size:13px;color:#999">${opts.note}</td></tr>
        <tr><td style="padding-top:24px;font-size:12px;color:#bbb;border-top:1px solid #eee">Purrmanent — your 90-day cat-parent guide. You received this because someone used this email to sign up.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
      const text = `Purrmanent

${opts.heading}

${opts.intro}

${opts.buttonLabel}:
${opts.url}

${opts.note}

— Purrmanent. You received this because someone used this email to sign up.`;
      return { html, text };
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
        requireEmailVerification: false,
        minPasswordLength: 8,
        sendResetPassword: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
          const { html, text } = buildEmail({
            heading: 'Reset your password',
            intro:
              'We received a request to reset the password for your Purrmanent account. If this was you, use the button below.',
            buttonLabel: 'Reset password',
            url,
            note: "If you didn't request this, you can safely ignore this email — your password won't change.",
          });
          await sendEmail(
            user.email,
            'Reset your Purrmanent password',
            html,
            text,
          );
        },
      },
      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        // verification links expire (not forever); a fresh one can be requested
        // via POST /api/auth/send-verification (spec §2.7).
        expiresIn: 60 * 60 * 24, // 24 hours
        sendVerificationEmail: async ({
          user,
          url,
        }: {
          user: { email: string };
          url: string;
        }) => {
          const { html, text } = buildEmail({
            heading: 'Confirm your email',
            intro:
              "Welcome to Purrmanent! Please confirm this email address to activate your account and start your cat's 90-day journey.",
            buttonLabel: 'Verify email',
            url,
            note: 'This link expires in 24 hours. If it expires, you can request a new one from the app.',
          });
          await sendEmail(
            user.email,
            'Verify your Purrmanent email',
            html,
            text,
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
        // 'serial' => integer auto-increment ids; better-auth omits the id on
        // insert and the Postgres SERIAL column fills it (matches our schema).
        // (useNumberId only affects better-auth's own migration generator,
        // which we don't use — we ship a hand-written migration.)
        database: { generateId: 'serial' },
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
