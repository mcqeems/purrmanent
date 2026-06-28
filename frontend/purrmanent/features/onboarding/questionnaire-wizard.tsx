"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  questionnaireSchema,
  type QuestionnaireInput,
  GENDERS,
  PERSONALITIES,
  ADOPTION_SOURCES,
  ADOPTER_EXPERIENCE,
} from "@/lib/validation/schemas";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { useSubmitOnboarding } from "./hooks";

const CONCERNS = [
  "Litter box habits",
  "Eating / appetite",
  "Hiding a lot",
  "Scratching furniture",
  "Vet care & vaccines",
];

const STEP_FIELDS: (keyof QuestionnaireInput)[][] = [
  ["catName", "catAgeMonths", "catGender", "catBreed", "catPersonality"],
  ["adoptionDate", "adoptionSource", "shelterCode"],
  ["adopterExperience", "homeType", "householdComposition", "concerns"],
];

export function QuestionnaireWizard({
  prefill,
}: {
  prefill?: Partial<QuestionnaireInput>;
}) {
  const router = useRouter();
  const submit = useSubmitOnboarding();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<QuestionnaireInput>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: { concerns: [], ...prefill },
  });
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form;

  const optionalNumber = { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) };

  async function next() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  }

  async function onSubmit(values: QuestionnaireInput) {
    setServerError(null);
    try {
      const cat = await submit.mutateAsync({
        ...values,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Jakarta",
        preferredLanguage: "en",
      });
      router.push(`/cats/${cat.id}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not save. Try again.",
      );
    }
  }

  return (
    <Card className="mx-auto max-w-xl">
      <p className="mb-1 text-sm font-medium uppercase tracking-[0.2px] text-accent-violet">
        Step {step + 1} of {STEP_FIELDS.length}
      </p>
      <h1 className="mb-6 text-2xl font-semibold">Tell us about your cat</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 0 && (
          <>
            <Field label="Cat's name" htmlFor="catName" error={errors.catName?.message}>
              <Input id="catName" {...register("catName")} />
            </Field>
            <Field label="Age (months)" htmlFor="catAgeMonths" error={errors.catAgeMonths?.message}>
              <Input id="catAgeMonths" type="number" min={0} {...register("catAgeMonths", optionalNumber)} />
            </Field>
            <Field label="Gender" htmlFor="catGender" error={errors.catGender?.message}>
              <Select id="catGender" defaultValue="" {...register("catGender")}>
                <option value="">Unknown</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="Breed" htmlFor="catBreed" error={errors.catBreed?.message}>
              <Input id="catBreed" placeholder="e.g. Domestic shorthair" {...register("catBreed")} />
            </Field>
            <Field label="Personality" htmlFor="catPersonality" error={errors.catPersonality?.message}>
              <Select id="catPersonality" defaultValue="" {...register("catPersonality")}>
                <option value="" disabled>Choose…</option>
                {PERSONALITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Adoption date" htmlFor="adoptionDate" error={errors.adoptionDate?.message}>
              <Input id="adoptionDate" type="date" {...register("adoptionDate")} />
            </Field>
            <Field label="Adoption source" htmlFor="adoptionSource" error={errors.adoptionSource?.message}>
              <Select id="adoptionSource" defaultValue="" {...register("adoptionSource")}>
                <option value="" disabled>Choose…</option>
                {ADOPTION_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Shelter code (optional)" htmlFor="shelterCode" error={errors.shelterCode?.message}>
              <Input id="shelterCode" {...register("shelterCode")} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Your experience" htmlFor="adopterExperience" error={errors.adopterExperience?.message}>
              <Select id="adopterExperience" defaultValue="" {...register("adopterExperience")}>
                <option value="" disabled>Choose…</option>
                {ADOPTER_EXPERIENCE.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </Select>
            </Field>
            <Field label="Home type" htmlFor="homeType">
              <Input id="homeType" placeholder="apartment, house…" {...register("homeType")} />
            </Field>
            <Field label="Household" htmlFor="householdComposition">
              <Input id="householdComposition" placeholder="e.g. couple, kids, other pets" {...register("householdComposition")} />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-ink-deep">Any concerns?</legend>
              {CONCERNS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={c} {...register("concerns")} />
                  {c}
                </label>
              ))}
            </fieldset>
          </>
        )}

        {serverError && <p className="text-sm text-accent-pink">{serverError}</p>}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < STEP_FIELDS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? "Building your plan…" : "Build my plan"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
