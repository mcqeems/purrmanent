'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	createCatSchema,
	type CreateCatInput,
	GENDERS,
	PERSONALITIES,
	ADOPTION_SOURCES,
} from '@/lib/validation/schemas';
import type { Cat } from '@/lib/types/api';
import { Button, Field, Input, SelectField } from '@/components/ui';
import { useCreateCat, useUpdateCat } from './hooks';
import { PhotoUpload } from './photo-upload';
import { toast } from '@/components/ui';

export function CatForm({ cat, onDone }: { cat?: Cat; onDone?: () => void }) {
	const create = useCreateCat();
	const update = useUpdateCat(cat?.id ?? 0);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<CreateCatInput>({
		resolver: zodResolver(createCatSchema),
		defaultValues: cat
			? {
					name: cat.name,
					ageMonths: cat.ageMonths ?? undefined,
					gender:
						cat.gender === 'male' || cat.gender === 'female'
							? cat.gender
							: undefined,
					breed: cat.breed ?? undefined,
					personality: cat.personality,
					adoptionDate: cat.adoptionDate,
					adoptionSource: cat.adoptionSource,
					shelterCode: cat.shelterCode ?? undefined,
					photoUrl: cat.photoUrl ?? undefined,
				}
			: undefined,
	});

	const optionalNumber = {
		setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
	};

	async function onSubmit(values: CreateCatInput) {
		setServerError(null);
		try {
			if (cat) {
				const result = await update.mutateAsync(values);
				if (!result) {
					throw new Error('Failed to update the cat!');
				}
				toast.success(`${result.name} has been updated successfully!`);
			} else {
				const result = await create.mutateAsync(values);
				if (!result) {
					throw new Error('Failed to add the cat!');
				}
				toast.success(`Woohoo! ${result.name} just joined the team!`);
			}
			onDone?.();
		} catch (err) {
			toast.success('err');
			setServerError(err instanceof Error ? err.message : 'Could not save.');
		}
	}

	const pending = create.isPending || update.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Field label="Photo" htmlFor="cf-photo">
				<Controller
					control={control}
					name="photoUrl"
					render={({ field }) => (
						<PhotoUpload value={field.value} onChange={field.onChange} />
					)}
				/>
			</Field>
			<Field label="Name" htmlFor="cf-name" error={errors.name?.message}>
				<Input id="cf-name" {...register('name')} />
			</Field>
			<div className="grid grid-cols-2 gap-3">
				<Field
					label="Age (months)"
					htmlFor="cf-age"
					error={errors.ageMonths?.message}
				>
					<Input
						id="cf-age"
						type="number"
						min={0}
						{...register('ageMonths', optionalNumber)}
					/>
				</Field>
				<Field label="Gender" htmlFor="cf-gender">
					<Controller
						control={control}
						name="gender"
						render={({ field }) => (
							<SelectField
								id="cf-gender"
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
			</div>
			<Field label="Breed" htmlFor="cf-breed">
				<Input id="cf-breed" {...register('breed')} />
			</Field>
			<div className="grid grid-cols-2 gap-3">
				<Field
					label="Personality"
					htmlFor="cf-pers"
					error={errors.personality?.message}
				>
					<Controller
						control={control}
						name="personality"
						render={({ field }) => (
							<SelectField
								id="cf-pers"
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
				<Field
					label="Source"
					htmlFor="cf-src"
					error={errors.adoptionSource?.message}
				>
					<Controller
						control={control}
						name="adoptionSource"
						render={({ field }) => (
							<SelectField
								id="cf-src"
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
			</div>
			<Field
				label="Adoption date"
				htmlFor="cf-date"
				error={errors.adoptionDate?.message}
			>
				<Input id="cf-date" type="date" {...register('adoptionDate')} />
			</Field>
			{serverError && <p className="text-sm text-accent-pink">{serverError}</p>}
			<Button
				type="submit"
				className="w-full"
				disabled={pending}
				variant="emboss"
			>
				{pending ? 'Saving…' : cat ? 'Save changes' : 'Add cat'}
			</Button>
		</form>
	);
}
