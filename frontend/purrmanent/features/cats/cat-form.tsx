"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCatSchema,
  type CreateCatInput,
  GENDERS,
  PERSONALITIES,
  ADOPTION_SOURCES,
} from "@/lib/validation/schemas";
import type { Cat } from "@/lib/types/api";
import { Button, Field, Input, Select } from "@/components/ui";
import { useCreateCat, useUpdateCat } from "./hooks";

export function CatForm({ cat, onDone }: { cat?: Cat; onDone?: () => void }) {
  const create = useCreateCat();
  const update = useUpdateCat(cat?.id ?? 0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCatInput>({
    resolver: zodResolver(createCatSchema),
    defaultValues: cat
      ? {
          name: cat.name,
          ageMonths: cat.ageMonths ?? undefined,
          gender: cat.gender ?? undefined,
          breed: cat.breed ?? undefined,
          personality: cat.personality,
          adoptionDate: cat.adoptionDate,
          adoptionSource: cat.adoptionSource,
          shelterCode: cat.shelterCode ?? undefined,
        }
      : undefined,
  });

  const optionalNumber = {
    setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
  };

  async function onSubmit(values: CreateCatInput) {
    setServerError(null);
    try {
      if (cat) await update.mutateAsync(values);
      else await create.mutateAsync(values);
      onDone?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Name" htmlFor="cf-name" error={errors.name?.message}>
        <Input id="cf-name" {...register("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age (months)" htmlFor="cf-age" error={errors.ageMonths?.message}>
          <Input id="cf-age" type="number" min={0} {...register("ageMonths", optionalNumber)} />
        </Field>
        <Field label="Gender" htmlFor="cf-gender">
          <Select id="cf-gender" defaultValue={cat?.gender ?? ""} {...register("gender")}>
            <option value="">Unknown</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Breed" htmlFor="cf-breed">
        <Input id="cf-breed" {...register("breed")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Personality" htmlFor="cf-pers" error={errors.personality?.message}>
          <Select id="cf-pers" defaultValue={cat?.personality ?? ""} {...register("personality")}>
            <option value="" disabled>Choose…</option>
            {PERSONALITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Source" htmlFor="cf-src" error={errors.adoptionSource?.message}>
          <Select id="cf-src" defaultValue={cat?.adoptionSource ?? ""} {...register("adoptionSource")}>
            <option value="" disabled>Choose…</option>
            {ADOPTION_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Adoption date" htmlFor="cf-date" error={errors.adoptionDate?.message}>
        <Input id="cf-date" type="date" {...register("adoptionDate")} />
      </Field>
      {serverError && <p className="text-sm text-accent-pink">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : cat ? "Save changes" : "Add cat"}
      </Button>
    </form>
  );
}
