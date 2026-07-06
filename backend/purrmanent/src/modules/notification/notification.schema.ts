import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Standard browser PushSubscription JSON shape. */
export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
});

export const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export class PushSubscribeDto extends createZodDto(pushSubscribeSchema) {}
export class UnsubscribeDto extends createZodDto(unsubscribeSchema) {}
