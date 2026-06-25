import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { MENTION_COLUMNS } from '../checklist/checklist.schema';

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  // already-resolved @mention enum from the browser (spec §8.5)
  contextMention: z.enum(MENTION_COLUMNS).nullish(),
  catId: z.number().int().positive().optional(),
});

export class ChatMessageDto extends createZodDto(chatMessageSchema) {}
