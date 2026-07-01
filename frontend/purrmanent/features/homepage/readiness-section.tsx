import { Check, Home as HomeIcon, Info, Activity } from 'lucide-react';
import { Card, FadeInItem } from '@/components/ui';

const HOME_READINESS = [
	{
		category: 'Space & Security Prep',
		icon: HomeIcon,
		items: [
			'Dedicated quiet "basecamp" room (separate from family traffic)',
			'Secure mesh screens installed on all open windows & balconies',
			'Removal of toxic houseplants (e.g. lilies, aloe vera, ivy)',
			'Hiding spots created (cardboard boxes, cat tunnels)'
		]
	},
	{
		category: 'Adopter Knowledge Prep',
		icon: Info,
		items: [
			'Understanding "slow blinking" for trust building',
			'Recognizing stress indicators (flattened ears, tail flicking)',
			'Commitment to keep cat indoors only to ensure safety',
			'Awareness of normal appetite shifts during transition'
		]
	},
	{
		category: 'Material & Technical Setup',
		icon: Activity,
		items: [
			'1+1 litter box setup (one box per cat, plus one extra)',
			'Separate stations for food and fresh water (instinctive preference)',
			'Vertical scratching posts (sisal rope or sturdy cardboard)',
			'High-quality grain-friendly food matching shelter diet'
		]
	}
];

export function ReadinessSection() {
	return (
		<section id="readiness-checklists" className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid md:grid-cols-3 gap-8 items-center mb-16">
					<FadeInItem viewport={true} yOffset={20} className="md:col-span-2 text-left space-y-4">
						<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full inline-block">
							PREPARATION REQUIREMENT
						</span>
						<h2 className="font-display text-4xl font-bold text-ink-deep">
							Adoption Prerequisites: Is your home ready?
						</h2>
						<p className="text-muted text-base leading-relaxed max-w-xl">
							Adopting is a commitment. Verify these administrative, space, and setup requirements before bringing your cat home.
						</p>
					</FadeInItem>

					{/* 
						IMAGE PLACEHOLDER: Cat Setup Gear Illustration
						Description: A hand-drawn sketch of essential cat supplies (scratching post, bowls, carrier).
						Prompt for Image Generation Model: 
						"A hand-drawn pencil sketch and watercolor wash illustration of a cat scratching post, food bowl, water fountain, and a cat carrier bag grouped together, cozy organic look, white background, simple outline doodle --no 3d render"
					*/}
					<FadeInItem viewport={true} yOffset={20} className="md:col-span-1 flex justify-center">
						<div className="w-full max-w-[240px] h-[160px] border-2 border-dashed border-accent-violet/30 rounded-2xl bg-surface-press-light/35 flex flex-col items-center justify-center p-4 hover:border-accent-violet/50 transition-colors duration-300">
							<div className="size-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet mb-2">
								<HomeIcon size={18} className="text-accent-violet" />
							</div>
							<span className="text-[10px] font-bold uppercase tracking-wider text-ink-deep text-center font-mono">
								Illustration Space:
							</span>
							<span className="text-[9px] text-muted text-center leading-normal mt-1 max-w-[180px]">
								Cat Supplies & Setup Gear
							</span>
						</div>
					</FadeInItem>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					{HOME_READINESS.map((col) => {
						const CategoryIcon = col.icon;
						return (
							<Card key={col.category} variant="light" className="bg-surface-press-light/30 border border-hairline-cloud hover:border-accent-violet/20 hover:shadow-md transition-all flex flex-col p-8 rounded-xl h-full shadow-sm">
								<div className="flex items-center gap-3 mb-6">
									<div className="size-9 rounded-lg bg-accent-violet/10 flex items-center justify-center text-accent-violet shrink-0">
										<CategoryIcon size={18} />
									</div>
									<h3 className="font-display text-md font-bold text-ink-deep">
										{col.category}
									</h3>
								</div>
								<ul className="space-y-4 flex-1">
									{col.items.map((item, i) => (
										<li key={i} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
											<Check size={14} className="text-accent-violet shrink-0 mt-0.5" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
