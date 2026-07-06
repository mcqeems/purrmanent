'use client';

import { useMemo, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cat, Check } from 'lucide-react';
import { useSession } from '@/lib/auth/client';
import { useCats } from '@/features/cats/hooks';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useOnboardingFlow } from './use-onboarding-flow';
import {
	OnboardingStepFields,
	ONBOARDING_STEP_LABELS,
} from './onboarding-steps';
import Image from 'next/image';
import catSleep from '@/app/assets/onboarding/cat-sleep.png';

function dismissedKey(userId: string) {
	return `purrmanent.onboardingDismissed.${userId}`;
}

/**
 * Full-screen onboarding, auto-shown on the dashboard for accounts with no
 * cats yet. Skipping sets a per-account localStorage flag (same pattern as
 * SiteTour's tourSeen) so it never reappears — no "relaunch" entry point by
 * design; a skipped user falls back to the plain "add a cat" flow.
 *
 * ILLUSTRATION SLOT: the left panel below has a placeholder icon tile where a
 * custom illustration should go — something like a cozy line-art/flat
 * illustration of a cat settling into a home (a cat curled up on a cushion,
 * or unpacking/moving-in themed art) matching the reference's "few clicks
 * away" hero panel. Swap the <Cat> icon block for an <Image> once art exists.
 */
export function OnboardingModal() {
	const { data } = useSession();
	const { data: cats, isLoading } = useCats();
	const [dismissed, setDismissed] = useState(false);
	const userId = data?.user?.id;

	// Derived, not effect-driven: open whenever we know the account has no
	// cats yet and hasn't dismissed it (this session or a prior one).
	const open = useMemo(() => {
		if (!userId || isLoading || !cats) return false;
		if (dismissed) return false;
		if (cats.length > 0) return false;
		return !localStorage.getItem(dismissedKey(userId));
	}, [userId, isLoading, cats, dismissed]);

	const {
		form,
		step,
		next,
		back,
		onSubmit,
		serverError,
		isLastStep,
		isPending,
	} = useOnboardingFlow();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	function skip() {
		if (userId) localStorage.setItem(dismissedKey(userId), '1');
		setDismissed(true);
	}

	if (!open) return null;

	return (
		<DialogPrimitive.Root open={open}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[pm-fade-in_150ms_ease-out]" />
				<DialogPrimitive.Content className="fixed inset-2 z-50 overflow-hidden rounded-2xl bg-surface-canvas-light shadow-[rgba(0,0,0,0.25)_0_25px_50px_-12px] focus:outline-none data-[state=open]:animate-[pm-fade-in_180ms_ease-out] sm:inset-6 md:inset-10 lg:inset-16">
					<DialogPrimitive.Title className="sr-only">
						Set up your cat&apos;s 90-day plan
					</DialogPrimitive.Title>
					<div className="grid h-full grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
						{/* Left panel — fixed across steps. Illustration slot marked below. */}
						<div className="hidden flex-col justify-between bg-surface-canvas-dark p-10 text-on-primary md:flex">
							<div>
								<span className="font-display text-xl font-bold">
									Purrmanent
								</span>
								<h2 className="mt-10 font-display text-3xl font-bold leading-tight">
									A few steps to your cat&apos;s 90-day plan.
								</h2>
								<p className="mt-3 text-on-dark-muted">
									Tell us about your cat and we&apos;ll build a day-by-day
									settling-in plan tailored to their personality and your home.
								</p>
							</div>
							{/* Illustration placeholder — replace with art (see component doc comment). */}
							<div className="flex justify-center item-center">
								<Image
									src={catSleep}
									alt="Cat Sleeping"
									width={500}
									height={500}
								/>
							</div>
							{/*<div className="flex aspect-square w-full max-w-56 items-center justify-center rounded-2xl border border-dashed border-on-dark-faint bg-on-dark-faint/40">
								<Cat
									className="size-20 text-on-dark-muted"
									strokeWidth={1.25}
								/>
							</div>*/}
						</div>

						{/* Right panel — step indicator + form content. */}
						<div className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
							<div className="flex items-start justify-between gap-4">
								<ol className="flex flex-1 flex-col gap-3">
									{ONBOARDING_STEP_LABELS.map((label, i) => {
										const done = i < step;
										const current = i === step;
										return (
											<li
												key={label}
												className="flex items-center gap-3 text-sm"
											>
												<span
													className={cn(
														'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
														done &&
															'border-accent-violet bg-accent-violet text-on-primary',
														current &&
															'border-accent-violet text-accent-violet',
														!done &&
															!current &&
															'border-hairline-cool text-muted',
													)}
												>
													{done ? <Check size={13} /> : i + 1}
												</span>
												<span
													className={cn(
														current
															? 'font-semibold text-ink-deep'
															: done
																? 'text-ink-deep'
																: 'text-muted',
													)}
												>
													{label}
												</span>
											</li>
										);
									})}
								</ol>
								<button
									type="button"
									onClick={skip}
									className="shrink-0 text-sm font-medium text-muted hover:text-ink-deep cursor-pointer"
								>
									Skip for now
								</button>
							</div>

							<form
								onSubmit={onSubmit}
								className="mt-8 flex flex-1 flex-col gap-4"
							>
								<div className="flex-1 space-y-4">
									<OnboardingStepFields
										step={step}
										register={register}
										control={control}
										errors={errors}
									/>
								</div>

								{serverError && (
									<p className="text-sm text-accent-pink">{serverError}</p>
								)}

								<div className="flex justify-between border-t border-hairline-cloud pt-4">
									<Button
										type="button"
										variant="ghost"
										onClick={back}
										disabled={step === 0}
									>
										Previous step
									</Button>
									{!isLastStep ? (
										<Button type="button" variant="emboss" onClick={next}>
											Next
										</Button>
									) : (
										<Button type="submit" variant="emboss" disabled={isPending}>
											{isPending ? 'Building your plan…' : 'Build my plan'}
										</Button>
									)}
								</div>
							</form>
						</div>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
