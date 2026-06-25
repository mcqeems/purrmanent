/**
 * The 3-3-3 rule (spec §2.1/§2.2):
 *   - Decompression: days 1-3 (extended to 5 for shy cats, plan generator)
 *   - Routine:       days 4-21
 *   - Home:          days 22-90
 * Phase-milestone thresholds inject on days 3, 21, 90.
 *
 * Pure, deterministic functions — no AI, no I/O. Unit-tested in isolation.
 */
export type Phase = 'decompression' | 'routine' | 'home';

export const DEFAULT_DECOMPRESSION_DAYS = 3;
export const SHY_DECOMPRESSION_DAYS = 5;
export const ROUTINE_END_DAY = 21;
export const HOME_END_DAY = 90;
export const PHASE_THRESHOLDS = [3, 21, 90] as const;

export function phaseForDay(
  dayNumber: number,
  decompressionDays: number = DEFAULT_DECOMPRESSION_DAYS,
): Phase {
  if (dayNumber <= decompressionDays) return 'decompression';
  if (dayNumber <= ROUTINE_END_DAY) return 'routine';
  return 'home';
}

export interface QuestionnaireInput {
  catPersonality: string;
  adopterExperience?: string;
}

export interface PersonalizedPlan {
  decompressionDays: number;
  phases: { phase: Phase; startDay: number; endDay: number }[];
  showEducationalTooltips: boolean;
  generatedAt: string;
}

/**
 * Rule-based plan generation (spec §2.2 / §8.2). Deterministic mapping:
 * shy cats get an extended decompression window; first-time adopters get
 * educational tooltips enabled.
 */
export function generatePlan(input: QuestionnaireInput): PersonalizedPlan {
  const decompressionDays =
    input.catPersonality === 'shy'
      ? SHY_DECOMPRESSION_DAYS
      : DEFAULT_DECOMPRESSION_DAYS;

  return {
    decompressionDays,
    phases: [
      { phase: 'decompression', startDay: 1, endDay: decompressionDays },
      {
        phase: 'routine',
        startDay: decompressionDays + 1,
        endDay: ROUTINE_END_DAY,
      },
      { phase: 'home', startDay: ROUTINE_END_DAY + 1, endDay: HOME_END_DAY },
    ],
    showEducationalTooltips: input.adopterExperience === 'first-time',
    generatedAt: new Date().toISOString(),
  };
}

/** Day number (1-based) for a cat given its adoption date and "today". */
export function dayNumberFor(
  adoptionDate: string | Date,
  today = new Date(),
): number {
  const start = new Date(adoptionDate);
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.floor((todayUtc - startUtc) / 86_400_000);
  return diffDays + 1; // adoption day is Day 1
}
