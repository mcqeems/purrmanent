import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Manual email/password registration (spec §2.7: min 8 chars, letter+number). */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, 'must contain a letter')
    .regex(/[0-9]/, 'must contain a number'),
  name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

/** (Re)send a verification email; callbackURL is where to land after verifying. */
export const sendVerificationSchema = z.object({
  email: z.string().email(),
  callbackURL: z.string().optional(),
});

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class SendVerificationDto extends createZodDto(sendVerificationSchema) {}
