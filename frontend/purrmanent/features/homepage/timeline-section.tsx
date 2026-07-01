'use client';

import { useState } from 'react';
import { Calendar, Activity, Check } from 'lucide-react';
import { Card, FadeInItem } from '@/components/ui';

const TIMELINE_PHASES = [
	{
		phase: 'DAYS 1 - 3',
		title: 'Decompression',
		desc: 'Focus on setting up a quiet "safe zone". Your cat may hide, sleep, and eat sparingly. Keep food and water separated.',
		focus: 'Safety & quiet space setup',
		badge: '01',
		illustrationName: 'Shy / Hiding Cat',
		illustrationDesc: 'A hand-drawn sketch of a cat peeking out from under a bed.',
		illustrationPrompt: '"A hand-drawn pencil sketch and watercolor wash illustration of a cat peeking shyly from under a bed skirt, soft warm colors, white background, simple outline doodle --no 3d render"',
		tasks: [
			'Select a quiet, low-traffic bedroom as your cat\'s basecamp.',
			'Provide at least two cardboard boxes or hiding spots.',
			'Keep food, fresh water, and litter boxes separated from each other.',
			'Avoid direct eye contact or picking up the cat; let them decompress.'
		]
	},
	{
		phase: 'WEEKS 1 - 3',
		title: 'Building Routine',
		desc: 'Your cat begins to explore the environment and understand feeding schedules. Introduce interactive play and establish rhythms.',
		focus: 'Feeding schedules & interactive play',
		badge: '02',
		illustrationName: 'Playing / Active Cat',
		illustrationDesc: 'A hand-drawn sketch of a cat playing with a wand toy.',
		illustrationPrompt: '"A hand-drawn pencil sketch and watercolor wash illustration of a cat playing with a wand toy, soft warm colors, white background, simple outline doodle --no 3d render"',
		tasks: [
			'Establish consistent twice-daily breakfast and dinner times.',
			'Conduct two 15-minute high-energy play sessions with wand toys.',
			'Introduce scent swapping (rub towels on cat, place in main rooms).',
			'Begin gentle grooming sessions to encourage skin scent binding.'
		]
	},
	{
		phase: 'MONTHS 1 - 3',
		title: 'Home Integration',
		desc: 'Building deep bonds of trust and comfort. The cat feels secure, starts displaying their true personality, and integrates fully.',
		focus: 'Bonding, confidence & graduation',
		badge: '03',
		illustrationName: 'Relaxed / Integrated Cat',
		illustrationDesc: 'A hand-drawn sketch of a relaxed cat sleeping on a cushion near a window.',
		illustrationPrompt: '"A hand-drawn pencil sketch and watercolor wash illustration of a happy cat sleeping curled up on a pillow near a sunny window, soft warm colors, white background, simple outline doodle --no 3d render"',
		tasks: [
			'Expand roaming access to other rooms under supervised hours.',
			'Introduce vertical spaces (high shelves, cat trees) for security.',
			'Encourage positive socialization using high-value lickable treats.',
			'Prepare for graduation and generate your Day 90 certificate.'
		]
	}
];

export function TimelineSection() {
	const [activeTimeline, setActiveTimeline] = useState(0);

	return (
		<section id="timeline" className="bg-surface-canvas-dark py-24 px-6 border-b border-hairline-violet/30 relative overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(106,95,193,0.08),rgba(255,255,255,0))]" />

			<div className="mx-auto max-w-5xl relative z-10">
				<FadeInItem viewport={true} yOffset={20} className="text-center mb-16">
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-lime bg-accent-lime/10 px-3 py-1 rounded-full">
						3-3-3 ADJUSTMENT TIMELINE
					</span>
					<h2 className="font-display text-3.5xl font-bold text-on-primary mt-4">
						Click a Phase to Reveal Checklist Tasks
					</h2>
					<p className="text-on-dark-muted mt-3 max-w-xl mx-auto text-sm leading-relaxed">
						Cats adapt in stages. Click any timeline block below to explore sample tasks and structured behavioral checkmarks.
					</p>
				</FadeInItem>

				<div className="grid gap-6 md:grid-cols-3">
					{TIMELINE_PHASES.map((p, idx) => {
						const isSelected = activeTimeline === idx;
						return (
							<FadeInItem key={p.title} yOffset={24} className="h-full">
								<button
									id={`btn-timeline-phase-${idx}`}
									onClick={() => setActiveTimeline(idx)}
									className={`w-full text-left relative group bg-surface-night p-8 rounded-xl border flex flex-col justify-between h-full hover:-translate-y-1 hover:border-accent-lime/40 transition-all duration-300 ${
										isSelected ? 'border-accent-lime ring-1 ring-accent-lime/30 shadow-[0_4px_20px_rgba(194,239,78,0.1)]' : 'border-hairline-violet/50'
									}`}
								>
									<div>
										<div className="flex items-center justify-between mb-6">
											<span className={`text-xs font-bold uppercase tracking-[1px] px-3 py-1 rounded-full ${
												isSelected ? 'text-ink-deep bg-accent-lime' : 'text-accent-lime bg-accent-lime/10'
											}`}>
												{p.phase}
											</span>
											<span className={`font-display text-2xl font-bold transition-colors ${
												isSelected ? 'text-accent-lime' : 'text-on-dark-faint group-hover:text-accent-lime/20'
											}`}>
												{p.badge}
											</span>
										</div>
										<h3 className="font-display text-xl font-bold text-on-primary mb-3">
											{p.title}
										</h3>
										<p className="text-xs text-on-dark-muted leading-relaxed">
											{p.desc}
										</p>
										{/* 
											IMAGE PLACEHOLDER: Timeline Phase Illustration
											Description: {p.illustrationDesc}
											Prompt for Image Generation Model: 
											{p.illustrationPrompt}
										*/}
										<div className="w-full h-[80px] border border-dashed border-hairline-violet/30 rounded-lg bg-surface-canvas-dark/30 flex flex-col items-center justify-center p-2 mt-4 group-hover:border-accent-lime/30 transition-colors duration-300">
											<span className="text-[9px] font-mono text-accent-lime/60 group-hover:text-accent-lime font-bold uppercase tracking-wider text-center leading-normal">
												[Sketch Image: {p.illustrationName}]
											</span>
										</div>
									</div>
									<div className="mt-8 w-full pt-4 border-t border-hairline-violet/20 flex items-center gap-2">
										<Calendar size={14} className={isSelected ? 'text-accent-lime' : 'text-accent-violet'} />
										<span className={`text-xs font-semibold ${isSelected ? 'text-accent-lime' : 'text-accent-violet'}`}>
											Focus: {p.focus}
										</span>
									</div>
								</button>
							</FadeInItem>
						);
					})}
				</div>

				<FadeInItem viewport={true} yOffset={20} className="mt-10">
					<Card variant="featured" className="bg-surface-night border border-accent-lime/30 p-8 rounded-xl shadow-xl">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-hairline-violet/30">
							<div>
								<span className="text-[10px] uppercase font-bold text-accent-lime tracking-wider font-mono">Active Phase Guide</span>
								<h4 className="font-display text-lg font-bold text-on-primary mt-1">
									Sample Checklist: {TIMELINE_PHASES[activeTimeline].title} ({TIMELINE_PHASES[activeTimeline].phase})
								</h4>
							</div>
							<div className="flex items-center gap-2 text-xs text-on-dark-muted bg-surface-canvas-dark border border-hairline-violet/60 px-3 py-1.5 rounded-lg">
								<Activity size={14} className="text-accent-lime" />
								<span>Recommended milestones to unlock progress</span>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{TIMELINE_PHASES[activeTimeline].tasks.map((task, i) => (
								<div key={i} className="flex gap-3 items-start p-4 bg-surface-canvas-dark/40 border border-hairline-violet/20 rounded-lg hover:border-hairline-violet/60 transition-colors">
									<div className="size-5 rounded bg-accent-lime/10 border border-accent-lime/30 text-accent-lime flex items-center justify-center shrink-0 mt-0.5">
										<Check size={12} className="stroke-[3]" />
									</div>
									<p className="text-xs text-on-dark-muted leading-relaxed">{task}</p>
								</div>
							))}
						</div>
					</Card>
				</FadeInItem>

				<div className="text-center mt-12 text-xs text-on-dark-muted">
					* Cat decompression cycles vary. The 3-3-3 timeline acts as a general behavioral baseline.
				</div>
			</div>
		</section>
	);
}
