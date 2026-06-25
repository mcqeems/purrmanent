import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PERSONALITIES = ['shy', 'balanced', 'active', 'aggressive'] as const;
export const GENDERS = ['male', 'female', 'unknown'] as const;
export const ADOPTION_SOURCES = ['shelter', 'self', 'rescue'] as const;

/** spec §5.5 */
export const createCatSchema = z.object({
  name: z.string().min(1).max(100),
  ageMonths: z.number().int().min(0).max(360).optional(),
  gender: z.enum(GENDERS).optional(),
  breed: z.string().max(100).optional(),
  personality: z.enum(PERSONALITIES),
  adoptionDate: z.string().date(),
  adoptionSource: z.enum(ADOPTION_SOURCES),
  shelterCode: z.string().max(50).optional(),
  photoUrl: z.string().url().optional(),
});

export const updateCatSchema = createCatSchema.partial();

export class CreateCatDto extends createZodDto(createCatSchema) {}
export class UpdateCatDto extends createZodDto(updateCatSchema) {}
