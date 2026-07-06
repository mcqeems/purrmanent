import { z } from 'zod';

/**
 * Environment schema — validated with Zod at boot.
 * The app refuses to start if a required var is missing or malformed.
 *
 * ponytail: only DATABASE_URL is strictly required to boot. External service
 * keys (LLM, Resend, VAPID, Google) are optional so local dev boots without
 * every integration configured; the feature that needs a missing key fails
 * at call-time with a clear error, not at boot.
 */
export const envSchema = z.object({
  // Core
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_GLOBAL_PREFIX: z.string().default('api'),
  FRONTEND_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth (BetterAuth)
  BETTER_AUTH_SECRET: z.string().default('dev-insecure-secret-change-me'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3001'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  // Sender address. Resend's test sender (onboarding@resend.dev) only delivers
  // to the account owner's email — verify a domain and set this to use it.
  MAIL_FROM: z.string().default('Purrmanent <onboarding@resend.dev>'),

  // AI / RAG (Bynara router, OpenAI-compatible)
  LLM_API_KEY: z.string().optional(),
  LLM_BASE_URL: z.string().default('https://router.bynara.id/v1'),
  LLM_MODEL: z.string().default('mimo-v2.5-hermes'),
  LLM_MODEL_PRO: z.string().default('mimo-v2.5-pro-hermes'),

  // Web Push (VAPID)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:team@purrmanent.app'),

  // Default daily-reset / reminder timezone (ceiling: WIB only)
  APP_TIMEZONE: z.string().default('Asia/Jakarta'),
});

export type Env = z.infer<typeof envSchema>;

/** ConfigModule `validate` hook — fail fast with a readable message. */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
