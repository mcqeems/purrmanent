import { z } from 'zod';

// Zod schemas mirroring the backend DTOs (backend-api-docs.json).
// Used by react-hook-form resolvers and for client-side guards before POST.

export const GENDERS = ['male', 'female', 'unknown'] as const;
export const PERSONALITIES = [
  'shy',
  'balanced',
  'active',
  'aggressive',
] as const;
export const ADOPTION_SOURCES = ['shelter', 'self', 'rescue'] as const;
export const KANBAN_STATUSES = ['todo', 'progress', 'done'] as const;
export const CHECKLIST_BOARDS = ['daily', 'phase'] as const;
export const HEALTH_RECORD_TYPES = [
  'vaccination',
  'deworming',
  'vet_visit',
  'weight',
  'note',
] as const;
export const ADOPTER_EXPERIENCE = [
  'first-time',
  'some',
  'experienced',
] as const;

/** Backend accepts ISO date strings (YYYY-MM-DD). Version-proof regex guard. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a YYYY-MM-DD date');

const id = z.number().int().positive();

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a number'),
  name: z.string().min(1).max(100).optional(),
});

export const sendVerificationSchema = z.object({
  email: z.email(),
  callbackURL: z.string().optional(),
});

// ── Cats ────────────────────────────────────────────────────────────────────
export const createCatSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  ageMonths: z.number().int().min(0).max(360).optional(),
  gender: z.enum(GENDERS).optional(),
  breed: z.string().max(100).optional(),
  personality: z.enum(PERSONALITIES),
  adoptionDate: isoDate,
  adoptionSource: z.enum(ADOPTION_SOURCES),
  shelterCode: z.string().max(50).optional(),
  photoUrl: z.url().optional(),
});

export const updateCatSchema = createCatSchema.partial();

// ── Onboarding ───────────────────────────────────────────────────────────────
export const questionnaireSchema = z.object({
  catName: z.string().min(1, 'Name is required').max(100),
  catAgeMonths: z.number().int().min(0).max(360).optional(),
  catGender: z.enum(GENDERS).optional(),
  catBreed: z.string().max(100).optional(),
  adoptionDate: isoDate,
  adoptionSource: z.enum(ADOPTION_SOURCES),
  shelterCode: z.string().max(50).optional(),
  catPersonality: z.enum(PERSONALITIES),
  adopterExperience: z.enum(ADOPTER_EXPERIENCE),
  homeType: z.string().max(30).optional(),
  householdComposition: z.string().max(50).optional(),
  concerns: z.array(z.string()).optional(),
  otherConcerns: z.string().optional(),
  timezone: z.string().max(50).optional(),
  preferredLanguage: z.string().max(5).optional(),
});

// ── Checklist ────────────────────────────────────────────────────────────────
export const customTodoSchema = z.object({
  catId: id,
  itemText: z.string().min(1, 'Required').max(500),
  board: z.enum(CHECKLIST_BOARDS).default('daily'),
});

export const moveItemSchema = z.object({
  itemId: id,
  newStatus: z.enum(KANBAN_STATUSES),
});

// ── Crisis ───────────────────────────────────────────────────────────────────
export const identifyCrisisSchema = z.object({
  catId: id,
  prompt: z.string().min(1, "Describe what's happening").max(500),
});

export const crisisStepSchema = z.object({
  eventId: id,
  stepIndex: z.number().int().min(0),
});

export const resolveCrisisSchema = z.object({
  eventId: id,
  isDone: z.boolean(),
  reasonNotDone: z.string().max(1000).optional(),
});

// ── Coach ────────────────────────────────────────────────────────────────────
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  contextMention: z.enum(KANBAN_STATUSES).nullish(),
  catId: id.optional(),
  conversationId: id.optional(),
});

export const confirmActionSchema = z.object({
  actionName: z.string().min(1).max(64),
  args: z.record(z.string(), z.unknown()).default({}),
  confirm: z.boolean(),
  catId: id.optional(),
});

// ── Health log ────────────────────────────────────────────────────────────────
const REQUIRED_RECORD_FIELD: Record<
  (typeof HEALTH_RECORD_TYPES)[number],
  { key: string; type: 'string' | 'number' }
> = {
  vaccination: { key: 'vaccineName', type: 'string' },
  deworming: { key: 'product', type: 'string' },
  vet_visit: { key: 'reason', type: 'string' },
  weight: { key: 'weightGrams', type: 'number' },
  note: { key: 'text', type: 'string' },
};

export const createHealthRecordSchema = z
  .object({
    catId: id,
    recordType: z.enum(HEALTH_RECORD_TYPES),
    recordData: z.record(z.string(), z.unknown()),
    recordedAt: isoDate,
    nextDueDate: isoDate.optional(),
  })
  .superRefine((val, ctx) => {
    const required = REQUIRED_RECORD_FIELD[val.recordType];
    if (typeof val.recordData[required.key] !== required.type) {
      ctx.addIssue({
        code: 'custom',
        path: ['recordData', required.key],
        message: `${required.key} (${required.type}) is required for ${val.recordType} records`,
      });
    }
  });

export const updateHealthRecordSchema = z.object({
  recordData: z.record(z.string(), z.unknown()).optional(),
  recordedAt: isoDate.optional(),
  nextDueDate: isoDate.nullable().optional(),
});

// Inferred input types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCatInput = z.infer<typeof createCatSchema>;
export type UpdateCatInput = z.infer<typeof updateCatSchema>;
export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
export type CustomTodoInput = z.infer<typeof customTodoSchema>;
export type MoveItemInput = z.infer<typeof moveItemSchema>;
export type IdentifyCrisisInput = z.infer<typeof identifyCrisisSchema>;
export type CrisisStepInput = z.infer<typeof crisisStepSchema>;
export type ResolveCrisisInput = z.infer<typeof resolveCrisisSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ConfirmActionInput = z.infer<typeof confirmActionSchema>;
export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
export type UpdateHealthRecordInput = z.infer<typeof updateHealthRecordSchema>;
