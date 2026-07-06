import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Manual email/password registration (min 8 chars, letter+number). */
export const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, 'must contain a letter')
    .regex(/[0-9]/, 'must contain a number'),
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

/**
 * (Re)send a verification email; callbackURL is where to land after verifying.
 * The callbackURL must be a valid URL string. Origin validation (against
 * FRONTEND_ORIGINS allowlist) is performed in the service layer where
 * configuration is available.
 */
export const sendVerificationSchema = z.object({
  email: z.email(),
  callbackURL: z
    .string()
    .url('callbackURL must be a valid URL')
    .optional(),
});

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class SendVerificationDto extends createZodDto(sendVerificationSchema) {}
