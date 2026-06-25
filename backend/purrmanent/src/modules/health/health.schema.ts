import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HEALTH_RECORD_TYPES = [
  'vaccination',
  'deworming',
  'vet_visit',
  'weight',
  'note',
] as const;

/**
 * record_data is type-specific (spec §2.5). We keep a single ZodObject (so it
 * works with createZodDto / the global pipe) and enforce per-record_type
 * required fields with superRefine — equivalent to a discriminated union but
 * extendable as a DTO class.
 */
export const createHealthRecordSchema = z
  .object({
    catId: z.number().int().positive(),
    recordType: z.enum(HEALTH_RECORD_TYPES),
    recordData: z.record(z.string(), z.unknown()),
    recordedAt: z.string().date(),
    nextDueDate: z.string().date().optional(),
  })
  .superRefine((val, ctx) => {
    const d = val.recordData;
    const require = (key: string, type: 'string' | 'number') => {
      if (typeof d[key] !== type) {
        ctx.addIssue({
          code: 'custom',
          path: ['recordData', key],
          message: `${key} (${type}) is required for ${val.recordType} records`,
        });
      }
    };
    switch (val.recordType) {
      case 'vaccination':
        require('vaccineName', 'string');
        break;
      case 'deworming':
        require('product', 'string');
        break;
      case 'vet_visit':
        require('reason', 'string');
        break;
      case 'weight':
        require('weightGrams', 'number');
        break;
      case 'note':
        require('text', 'string');
        break;
    }
  });

export const updateHealthRecordSchema = z.object({
  recordData: z.record(z.string(), z.unknown()).optional(),
  recordedAt: z.string().date().optional(),
  nextDueDate: z.string().date().nullable().optional(),
});

export class CreateHealthRecordDto extends createZodDto(createHealthRecordSchema) {}
export class UpdateHealthRecordDto extends createZodDto(updateHealthRecordSchema) {}

export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
export type UpdateHealthRecordInput = z.infer<typeof updateHealthRecordSchema>;
