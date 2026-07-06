'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import {
	type QuestionnaireInput,
	GENDERS,
	PERSONALITIES,
	ADOPTION_SOURCES,
	ADOPTER_EXPERIENCE,
} from '@/lib/validation/schemas';
import { Field, Input, SelectField } from '@/components/ui';

const CONCERNS = [
	'Litter box habits',
	'Eating / appetite',
	'Hiding a lot',
	'Scratching furniture',
	'Vet care & vaccines',
];

/** Field names touched by each step — shared by both the modal and the
 * standalone page so `trigger()` validates the right subset per step. */
export const ONBOARDING_STEP_FIELDS: (keyof QuestionnaireInput)[][] = [
	['catName', 'catAgeMonths', 'catGender', 'catBreed', 'catPersonality'],
	['adoptionDate', 'adoptionSource', 'shelterCode'],
	['adopterExperience', 'homeType', 'householdComposition', 'concerns'],
];

export const ONBOARDING_STEP_LABELS = [
	'About your cat',
	'Adoption details',
	'Your household',
];

const optionalNumber = {
	setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
};

/**
 * Pure step content (fields only, no Card/nav chrome) — reused by the
 * full-screen OnboardingModal and the standalone /onboarding page so both
 * stay in sync with a single source of truth for the questionnaire.
 */
export function OnboardingStepFields({
	step,
	register,
	control,
	errors,
}: {
	step: number;
	register: UseFormRegister<QuestionnaireInput>;
	control: Control<QuestionnaireInput>;
	errors: FieldErrors<QuestionnaireInput>;
}) {
	if (step === 0) {
		return (
			<>
				<Field
					label="Cat's name"
					htmlFor="catName"
					error={errors.catName?.message}
				>
					<Input id="catName" {...register('catName')} />
				</Field>
				<Field
					label="Age (months)"
					htmlFor="catAgeMonths"
					error={errors.catAgeMonths?.message}
				>
					<Input
						id="catAgeMonths"
						type="number"
						min={0}
						{...register('catAgeMonths', optionalNumber)}
					/>
				</Field>
				<Field
					label="Gender"
					htmlFor="catGender"
					error={errors.catGender?.message}
				>
					<Controller
						control={control}
						name="catGender"
						render={({ field }) => (
							<SelectField
								id="catGender"
								value={field.value ?? ''}
								onValueChange={field.onChange}
								placeholder="Male"
								options={GENDERS.map((g) => ({
									value: g,
									label: g.charAt(0).toUpperCase() + g.slice(1),
								}))}
							/>
						)}
					/>
				</Field>
				<Field
					label="Breed"
					htmlFor="catBreed"
					error={errors.catBreed?.message}
				>
					<Input
						id="catBreed"
						placeholder="e.g. Domestic shorthair"
						{...register('catBreed')}
					/>
				</Field>
				<Field
					label="Personality"
					htmlFor="catPersonality"
					error={errors.catPersonality?.message}
				>
					<Controller
						control={control}
						name="catPersonality"
						render={({ field }) => (
							<SelectField
								id="catPersonality"
								value={field.value ?? ''}
								onValueChange={field.onChange}
								options={PERSONALITIES.map((p) => ({
									value: p,
									label: p.charAt(0).toUpperCase() + p.slice(1),
								}))}
							/>
						)}
					/>
				</Field>
			</>
		);
	}

	if (step === 1) {
		return (
			<>
				<Field
					label="Adoption date"
					htmlFor="adoptionDate"
					error={errors.adoptionDate?.message}
				>
					<Input id="adoptionDate" type="date" {...register('adoptionDate')} />
				</Field>
				<Field
					label="Adoption source"
					htmlFor="adoptionSource"
					error={errors.adoptionSource?.message}
				>
					<Controller
						control={control}
						name="adoptionSource"
						render={({ field }) => (
							<SelectField
								id="adoptionSource"
								value={field.value ?? ''}
								onValueChange={field.onChange}
								options={ADOPTION_SOURCES.map((s) => ({
									value: s,
									label: s.charAt(0).toUpperCase() + s.slice(1),
								}))}
							/>
						)}
					/>
				</Field>
				<Field
					label="Shelter code (optional)"
					htmlFor="shelterCode"
					error={errors.shelterCode?.message}
				>
					<Input id="shelterCode" {...register('shelterCode')} />
				</Field>
			</>
		);
	}

	return (
		<>
			<Field
				label="Your experience"
				htmlFor="adopterExperience"
				error={errors.adopterExperience?.message}
			>
				<Controller
					control={control}
					name="adopterExperience"
					render={({ field }) => (
						<SelectField
							id="adopterExperience"
							value={field.value ?? ''}
							onValueChange={field.onChange}
							options={ADOPTER_EXPERIENCE.map((e) => ({
								value: e,
								label: e.charAt(0).toUpperCase() + e.slice(1),
							}))}
						/>
					)}
				/>
			</Field>
			<Field label="Home type" htmlFor="homeType">
				<Input
					id="homeType"
					placeholder="apartment, house…"
					{...register('homeType')}
				/>
			</Field>
			<Field label="Household" htmlFor="householdComposition">
				<Input
					id="householdComposition"
					placeholder="e.g. couple, kids, other pets"
					{...register('householdComposition')}
				/>
			</Field>
			<fieldset className="flex flex-col gap-2">
				<legend className="text-sm font-medium text-ink-deep">
					Any concerns?
				</legend>
				{CONCERNS.map((c) => (
					<label key={c} className="flex items-center gap-2 text-sm">
						<input type="checkbox" value={c} {...register('concerns')} />
						{c}
					</label>
				))}
			</fieldset>
		</>
	);
}
