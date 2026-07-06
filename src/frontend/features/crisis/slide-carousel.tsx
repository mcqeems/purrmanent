'use client';

import { useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { CrisisSlide } from '@/lib/types/api';
import { useCompleteStep } from './api';

export function SlideCarousel({
	eventId,
	slides,
}: {
	eventId: number;
	slides: CrisisSlide[];
}) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
	const completeStep = useCompleteStep();
	const [done, setDone] = useState<Set<number>>(new Set());

	// Per-slide starting offset → flat global index for each todo (matches backend stepIndex).
	const slideBase = useMemo(() => {
		const bases: number[] = [];
		let acc = 0;
		for (const s of slides) {
			bases.push(acc);
			acc += s.todos.length;
		}
		return bases;
	}, [slides]);

	function toggle(globalIndex: number) {
		if (done.has(globalIndex)) return; // completion is one-way
		completeStep.mutate({ eventId, stepIndex: globalIndex });
		setDone((prev) => new Set(prev).add(globalIndex));
	}

	return (
		<div className="relative space-y-3">
			<div ref={emblaRef} className="overflow-hidden rounded-xl">
				<div className="flex gap-4">
					{slides.map((slide, si) => (
						<div
							key={si}
							className="min-w-0 flex-[0_0_100%] border border-hairline-cloud rounded-xl px-1 cursor-grab active:cursor-grabbing"
						>
							<div className="rounded-xl p-6">
								<p className="mb-1 text-xs uppercase tracking-[0.2px] text-muted font-bold">
									Step {si + 1} of {slides.length}
								</p>
								<h3 className="mb-3 text-xl font-semibold">{slide.title}</h3>
								<div className="prose-sm mb-4 space-y-2">
									<ReactMarkdown>{slide.markdown}</ReactMarkdown>
								</div>
								<ul className="space-y-2">
									{slide.todos.map((todo, ti) => {
										const idx = slideBase[si] + ti;
										const checked = done.has(idx);
										return (
											<li key={idx} className="flex items-center gap-2 text-sm">
												<Checkbox
													checked={checked}
													onCheckedChange={() => toggle(idx)}
												/>
												<span
													className={cn(checked && 'text-muted line-through')}
												>
													{todo}
												</span>
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					))}
				</div>
			</div>
			<button
				type="button"
				onClick={() => emblaApi?.scrollPrev()}
				className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-surface-canvas-light border border-hairline-cloud text-ink-deep shadow-sm  transition-colors cursor-pointer hover:bg-surface-press-light"
			>
				<ArrowLeft size={18} />
			</button>
			<button
				type="button"
				onClick={() => emblaApi?.scrollNext()}
				className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-surface-canvas-light border border-hairline-cloud text-ink-deep shadow-sm hover:bg-surface-press-light transition-colors cursor-pointer"
			>
				<ArrowRight size={18} />
			</button>
		</div>
	);
}
