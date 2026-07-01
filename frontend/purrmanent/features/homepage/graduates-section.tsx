'use client';

import { Trophy, ExternalLink } from 'lucide-react';
import { Card, FadeInItem } from '@/components/ui';
import TiltedCard from '@/components/TiltedCard';
import { MOCK_DASHBOARD_SVG, MOCK_HEALTH_LOG_SVG, MOCK_CRISIS_MODE_SVG } from './mock-svgs';

const GRADUATES = [
	{
		name: 'Milo',
		breed: 'Domestic Short Hair (Tabby)',
		age: '1.5 Years Old',
		tags: ['Shy Cat Path', 'Dog Housemate'],
		story: 'Went from hiding behind the washing machine on Day 1 to sleeping soundly on the sofa with a golden retriever housemate by Day 90.',
		mockup: MOCK_DASHBOARD_SVG,
		illustrationName: 'Milo Tabby Portrait',
		illustrationPrompt: '"A circular hand-drawn cat portrait stamp of a tabby cat looking happy, watercolor wash, warm lines, white background, simple outline doodle --no text"'
	},
	{
		name: 'Luna',
		breed: 'Bombay Cat (Black)',
		age: '6 Months Old',
		tags: ['Bold Cat Path', 'Active Player'],
		story: 'Luna was overly energetic, leading to playful scratching. Purrmanent\'s play schedules redirected her hunting instincts. She graduated fully settled.',
		mockup: MOCK_HEALTH_LOG_SVG,
		illustrationName: 'Luna Black Cat Portrait',
		illustrationPrompt: '"A circular hand-drawn cat portrait stamp of a black cat, watercolor wash, white background, simple outline doodle --no text"'
	},
	{
		name: 'Cleo',
		breed: 'Calico Cat',
		age: '4 Years Old',
		tags: ['Balanced Path', 'Senior Care'],
		story: 'Cleo integrated seamlessly using the standard timeline. Her adopters logged regular grooming schedules and vaccine checkups, ensuring a healthy senior lifestyle.',
		mockup: MOCK_CRISIS_MODE_SVG,
		illustrationName: 'Cleo Calico Portrait',
		illustrationPrompt: '"A circular hand-drawn cat portrait stamp of a calico cat, watercolor wash, white background, simple outline doodle --no text"'
	}
];

export function GraduatesSection() {
	return (
		<section id="graduates-portfolio" className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud relative">
			{/* 
				IMAGE PLACEHOLDER: "Graduated!" Cat Stamp Sticker
				Description: A circular hand-drawn stamp emblem of a cat graduation cap with a tassel, sketchy pencil outline, textured watercolor wash.
				Prompt for Image Generation Model: 
				"A circular hand-drawn stamp emblem of a cat graduation cap with a tassel, sketchy pencil outline, textured watercolor wash, warm electric lime tone, white background, simple outline doodle, Sentry color theme --no text"
			*/}
			<div className="absolute top-12 right-12 w-28 h-28 hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-accent-lime/30 bg-surface-canvas-light text-accent-lime rounded-full rotate-12 p-4 select-none hover:rotate-0 hover:scale-105 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
				<Trophy size={28} className="text-accent-lime stroke-[2]" />
				<span className="text-[9px] font-bold uppercase tracking-wider text-center mt-1 font-mono text-ink-deep">Graduated!</span>
			</div>

			<div className="mx-auto max-w-6xl px-6">
				<FadeInItem viewport={true} yOffset={20} className="text-center mb-16 max-w-2xl mx-auto">
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
						GRADUATE ARCHIVE
					</span>
					<h2 className="font-display text-4xl font-bold text-ink-deep mt-4">
						Day 90 Graduate Profiles
					</h2>
					<p className="text-muted mt-3 text-base leading-relaxed">
						Explore how various felines successfully decompressed and integrated into their permanent homes.
					</p>
				</FadeInItem>

				<div className="grid gap-12 lg:grid-cols-3">
					{GRADUATES.map((g) => (
						<Card key={g.name} variant="light" className="flex flex-col border border-hairline-cloud bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:border-accent-violet/25 transition-all duration-300">
							<div className="border border-hairline-cloud rounded-lg overflow-hidden p-1 bg-surface-night/5 mb-6">
								<TiltedCard
									imageSrc={g.mockup}
									altText={`${g.name}'s integration profile mockup`}
									captionText={`Click to inspect ${g.name}'s graduation report`}
									containerHeight="220px"
									imageHeight="210px"
									imageWidth="100%"
									scaleOnHover={1.03}
									rotateAmplitude={6}
								/>
							</div>

							<div className="flex-1 flex flex-col justify-between px-2">
								<div>
									<div className="flex items-center gap-4 mb-4">
										{/* 
											IMAGE PLACEHOLDER: Graduate Portrait Stamp
											Description: A circular hand-drawn cat portrait stamp for {g.name}.
											Prompt for Image Generation Model: 
											{g.illustrationPrompt}
										*/}
										<div className="size-14 border-2 border-dashed border-accent-violet/30 rounded-full bg-surface-press-light/30 flex items-center justify-center shrink-0 shadow-inner">
											<span className="text-[8px] font-mono text-accent-violet/70 font-bold uppercase tracking-wider text-center leading-normal">
												[Stamp: {g.name}]
											</span>
										</div>
										<div>
											<h3 className="font-display text-md font-bold text-ink-deep">
												{g.name}
											</h3>
											<p className="text-[10px] text-muted font-normal leading-normal">
												{g.breed} <br /> {g.age}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap gap-1.5 mb-3">
										{g.tags.map((t) => (
											<span key={t} className="text-[9px] font-bold uppercase tracking-wider text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded">
												{t}
											</span>
										))}
									</div>

									<p className="text-xs text-muted leading-relaxed mt-2">
										{g.story}
									</p>
								</div>

								<div className="mt-6 pt-4 border-t border-hairline-cloud flex items-center justify-between">
									<span className="text-[10px] text-accent-violet font-bold uppercase tracking-wider">Integrated Home Case</span>
									<div className="text-muted hover:text-accent-violet transition-colors">
										<ExternalLink size={14} />
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
