import Link from 'next/link';
import {
	ListChecks,
	ClipboardList,
	Building,
	Calendar,
	Trophy
} from 'lucide-react';
import { Button, Stagger, FadeInItem } from '@/components/ui';

const ONBOARDING_STEPS = [
	{
		number: '1',
		title: 'Link Your Shelter Account',
		desc: 'Connect using your shelter code or adoption ID to load your cat\'s baseline medical records.',
		icon: Building
	},
	{
		number: '2',
		title: 'Complete Onboarding Profile',
		desc: 'Fill out our behavioral questionnaire detailing your cat\'s initial temperament (shy, active, or bold).',
		icon: ClipboardList
	},
	{
		number: '3',
		title: 'Receive Custom 90-Day Plan',
		desc: 'Our system generates your custom plan tailored to your cat\'s specific traits and your home environment.',
		icon: Calendar
	},
	{
		number: '4',
		title: 'Track Checklists & Logs Daily',
		desc: 'Check off daily habits, log health metrics, and chat with our behaviorist AI when issues occur.',
		icon: ListChecks
	},
	{
		number: '5',
		title: 'Graduate & Unlock Bond',
		desc: 'Graduate on Day 90 with a fully decompressed, confident cat and a signed graduation certificate.',
		icon: Trophy
	}
];

export function OnboardingSection() {
	return (
		<section id="onboarding-steps" className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud relative">
			{/* 
				IMAGE PLACEHOLDER: "Log Daily Habits" Clipboard Sticker
				Description: A hand-drawn pencil sketch and watercolor wash illustration of a clipboard checklist with cat paw prints, warm colors, sticker outline.
				Prompt for Image Generation Model: 
				"A hand-drawn pencil sketch and watercolor wash illustration of a clipboard checklist with cat paw prints, warm colors, white background, sticker border outline --no text"
			*/}
			<div className="absolute bottom-8 left-12 w-28 h-28 hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-accent-pink/30 bg-surface-canvas-light text-ink-deep rounded-full -rotate-12 p-4 select-none hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
				<ListChecks size={28} className="text-accent-pink" />
				<span className="text-[9px] font-bold uppercase tracking-wider text-center mt-1 font-mono text-accent-pink">Log Habits</span>
			</div>

			<div className="mx-auto max-w-6xl px-6">
				<FadeInItem viewport={true} yOffset={20} className="text-center mb-16 max-w-2xl mx-auto">
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
						ROADMAP PIPELINE
					</span>
					<h2 className="font-display text-4xl font-bold text-ink-deep mt-4">
						How the program works
					</h2>
					<p className="text-muted mt-3 text-base leading-relaxed">
						A systematic transition structure from shelter adoption to fully integrated family member.
					</p>
				</FadeInItem>

				<div className="relative">
					<div className="absolute top-1/2 left-4 right-4 h-0.5 bg-hairline-cloud -translate-y-1/2 hidden lg:block z-0" />

					<Stagger viewport={true} delay={0.1} className="grid gap-8 lg:grid-cols-5 relative z-10">
						{ONBOARDING_STEPS.map((s) => {
							const StepIcon = s.icon;
							return (
								<FadeInItem key={s.number} yOffset={24} className="h-full">
									<div className="group flex flex-col items-center text-center p-6 bg-surface-canvas-light border border-hairline-cloud rounded-xl shadow-sm hover:shadow-md hover:border-accent-violet/30 transition-all duration-300 h-full relative">
										<div className="absolute -top-5 size-10 rounded-full bg-accent-violet text-on-primary font-display font-bold text-base flex items-center justify-center border-4 border-surface-canvas-light group-hover:bg-accent-lime group-hover:text-ink-deep shadow-sm transition-colors duration-300">
											{s.number}
										</div>

										<div className="size-12 rounded-full bg-surface-press-light flex items-center justify-center text-accent-violet group-hover:bg-accent-violet/10 group-hover:scale-105 transition-all duration-300 mt-4 mb-4">
											<StepIcon size={22} />
										</div>

										<h3 className="font-display text-md font-bold text-ink-deep mb-2">
											{s.title}
										</h3>

										<p className="text-xs text-muted leading-relaxed">
											{s.desc}
										</p>
									</div>
								</FadeInItem>
							);
						})}
					</Stagger>
				</div>

				<div className="text-center mt-14">
					<Button id="btn-steps-register" asChild variant="emboss" size="lg" className="px-10">
						<Link href="/register">Register Now</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
