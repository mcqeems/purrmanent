import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PERSONALITIES, GENDERS, ADOPTION_SOURCES } from '../cats/cat.schema';

export const EXPERIENCE_LEVELS = ['first-time', 'some', 'experienced'] as const;

/** spec §2.2 questionnaire (+ location/timezone fields). */
export const questionnaireSchema = z.object({
  catName: z.string().min(1).max(100),
  catAgeMonths: z.number().int().min(0).max(360).optional(),
  catGender: z.enum(GENDERS).optional(),
  catBreed: z.string().max(100).optional(),
  adoptionDate: z.string().date(),
  adoptionSource: z.enum(ADOPTION_SOURCES),
  shelterCode: z.string().max(50).optional(),
  catPersonality: z.enum(PERSONALITIES),
  adopterExperience: z.enum(EXPERIENCE_LEVELS),
  homeType: z.string().max(30).optional(),
  householdComposition: z.string().max(50).optional(),
  concerns: z.array(z.string()).optional(),
  otherConcerns: z.string().optional(),
  // persisted on the user — drives crons + Copilot language (plan §9)
  timezone: z.string().max(50).optional(),
  preferredLanguage: z.string().max(5).optional(),
});

export class QuestionnaireDto extends createZodDto(questionnaireSchema) {}
