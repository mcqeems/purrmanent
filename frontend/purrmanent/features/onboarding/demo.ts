import { apiFetch } from '@/lib/api/client';
import type { QuestionnaireInput } from '@/lib/validation/schemas';
import { PERSONALITIES, ADOPTION_SOURCES } from '@/lib/validation/schemas';

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

/**
 * Map the demo-prefill response onto questionnaire fields. The exact response
 * shape isn't in the OpenAPI (FRONTEND_BUILD_PLAN.md R8), so this is defensive:
 * it picks known/aliased keys and ignores anything unexpected.
 */
function mapPrefill(raw: Record<string, unknown>): Partial<QuestionnaireInput> {
  const out: Partial<QuestionnaireInput> = {};
  const name = str(raw.catName) ?? str(raw.name);
  if (name) out.catName = name;
  const breed = str(raw.catBreed) ?? str(raw.breed);
  if (breed) out.catBreed = breed;
  const shelter = str(raw.shelterCode);
  if (shelter) out.shelterCode = shelter;
  const src = str(raw.adoptionSource);
  if (src && (ADOPTION_SOURCES as readonly string[]).includes(src))
    out.adoptionSource = src as QuestionnaireInput['adoptionSource'];
  const pers = str(raw.catPersonality) ?? str(raw.personality);
  if (pers && (PERSONALITIES as readonly string[]).includes(pers))
    out.catPersonality = pers as QuestionnaireInput['catPersonality'];
  return out;
}

/** Fetch demo prefill for a shelter code. Never throws — returns undefined on miss. */
export async function fetchDemoPrefill(
  code: string,
): Promise<Partial<QuestionnaireInput> | undefined> {
  try {
    const raw = await apiFetch<Record<string, unknown>>('/demo/prefill', {
      query: { code },
    });
    return raw ? mapPrefill(raw) : undefined;
  } catch {
    return undefined;
  }
}
