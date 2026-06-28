import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MENTION_COLUMNS } from '../checklist/checklist.schema';

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  // already-resolved @mention enum from the browser (spec §8.5)
  contextMention: z.enum(MENTION_COLUMNS).nullish(),
  catId: z.number().int().positive().optional(),
  // continue a specific past conversation (else the latest for the cat is used)
  conversationId: z.number().int().positive().optional(),
});

export class ChatMessageDto extends createZodDto(chatMessageSchema) {}

/**
 * Body for confirming a write action the agent proposed (the `confirm` SSE
 * event). `args` are re-validated server-side by the action's own schema, so
 * they are safe to accept from the client here; `userId` is taken from the
 * session, never this body (anti-IDOR).
 */
export const confirmActionSchema = z.object({
  actionName: z.string().min(1).max(64),
  args: z.record(z.string(), z.unknown()).default({}),
  confirm: z.boolean(),
  // optional: links the follow-up message to the same conversation thread
  catId: z.number().int().positive().optional(),
});

export class ConfirmActionDto extends createZodDto(confirmActionSchema) {}
