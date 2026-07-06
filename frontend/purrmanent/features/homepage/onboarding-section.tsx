import Link from 'next/link';
import {
	ListChecks,
	ClipboardList,
	Building,
	Calendar,
	Trophy,
} from 'lucide-react';
import { Button, Stagger, FadeInItem } from '@/components/ui';

const ONBOARDING_STEPS = [
	{
		number: '1',
		title: 'Add your cat',
		desc: 'Name, age, personality. A shelter code is optional.',
		icon: Building,
	},
	{
		number: '2',
		title: 'Tell us about your cat',
		desc: 'Shy, active, or balanced. This sets your starting phase.',
		icon: ClipboardList,
	},
	{
		number: '3',
		title: 'Get your plan',
		desc: "Daily tasks appear based on your cat's phase. You can add your own too.",
		icon: Calendar,
	},
	{
		number: '4',
		title: 'Track daily',
		desc: 'Check off tasks, log health, ask the AI coach when you need help.',
		icon: ListChecks,
	},
	{
		number: '5',
		title: 'Graduate on Day 90',
		desc: 'Earn a certificate when your cat completes the program.',
		icon: Trophy,
	},
];

export function OnboardingSection() {
	return (
		<section
			id="onboarding-steps"
			className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud relative"
		>
			<div className="mx-auto max-w-6xl px-6">
				<FadeInItem
					viewport={true}
					yOffset={20}
					className="text-center mb-16 max-w-2xl mx-auto"
				>
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
						HOW IT WORKS
					</span>
					<h2 className="font-display text-4xl font-bold text-ink-deep mt-4">
						How it works
					</h2>
				</FadeInItem>

				<div className="relative">
					<div className="absolute top-1/2 left-4 right-4 h-0.5 bg-hairline-cloud -translate-y-1/2 hidden lg:block z-0" />

					<Stagger
						viewport={true}
						delay={0.1}
						className="grid gap-8 lg:grid-cols-5 relative z-10"
					>
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

				<FadeInItem viewport={true} yOffset={16} className="text-center mt-14">
					<Button
						id="btn-steps-register"
						asChild
						variant="emboss"
						size="lg"
						className="px-10"
					>
						<Link href="/register">Register Now</Link>
					</Button>
				</FadeInItem>
			</div>
		</section>
	);
}
