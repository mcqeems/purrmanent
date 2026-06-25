import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const identifyCrisisSchema = z.object({
  catId: z.number().int().positive(),
  prompt: z.string().min(1).max(500),
});

export const crisisStepSchema = z.object({
  eventId: z.number().int().positive(),
  stepIndex: z.number().int().min(0),
});

export const resolveCrisisSchema = z.object({
  eventId: z.number().int().positive(),
  isDone: z.boolean(),
  reasonNotDone: z.string().max(1000).optional(),
});

export class IdentifyCrisisDto extends createZodDto(identifyCrisisSchema) {}
export class CrisisStepDto extends createZodDto(crisisStepSchema) {}
export class ResolveCrisisDto extends createZodDto(resolveCrisisSchema) {}
