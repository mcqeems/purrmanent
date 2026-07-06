import {
	Sparkles,
	HeartPulse,
	Trophy,
	ClipboardList,
	ShieldCheck,
} from 'lucide-react';
import { Card, Stagger, FadeInItem } from '@/components/ui';
import Image from 'next/image';
import catInCardboard from '@/app/assets/home/cat-in-cardboard-box-illustration.png';

const FEATURES = [
	{
		icon: ClipboardList,
		title: '90-Day Roadmap',
		desc: 'Daily checklists that follow the 3-3-3 adjustment rule. Tasks adapt to your cat\'s personality.',
	},
	{
		icon: Sparkles,
		title: 'AI Coach',
		desc: 'Ask questions about your cat\'s behavior. Gets answers from a curated knowledge base. Not a replacement for a vet.',
	},
	{
		icon: HeartPulse,
		title: 'Health Log',
		desc: 'Track vaccinations, weight, and vet visits. Set reminders so nothing gets missed.',
	},
	{
		icon: ShieldCheck,
		title: 'Crisis Guidance',
		desc: 'Step-by-step protocols when something seems wrong — not eating, hiding, or acting out.',
	},
	{
		icon: Trophy,
		title: 'Progress & Badges',
		desc: 'Earn points for completing tasks. Graduate your cat on Day 90.',
	},
];

export function WhySection() {
	return (
		<section
			id="why-us"
			className="bg-surface-canvas-light text-ink-deep relative "
		>
			<div className="mx-auto max-w-6xl px-6 border-b border-hairline-cloud py-24">
				<div className="grid md:grid-cols-3 gap-8 items-center mb-16">
					<FadeInItem
						viewport={true}
						yOffset={20}
						className="md:col-span-2 text-left space-y-4"
					>
						<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full inline-block">
							WHY PURRMANENT?
						</span>
						<h2 className="font-display text-4xl font-bold text-ink-deep">
							What&apos;s inside
						</h2>
					</FadeInItem>

					<FadeInItem
						viewport={true}
						yOffset={20}
						className="md:col-span-1 flex justify-center"
					>
						<div className="w-full max-w-[240px] h-[160px] flex flex-col items-center justify-center p-4 duration-300 scale-100 hover:scale-105 transition-all duration-300 opacity-80 hover:opacity-100">
							<Image
								src={catInCardboard}
								alt="Cat in Cardboard Box"
								width={240}
								height={160}
								className="object-cover"
							/>
						</div>
					</FadeInItem>
				</div>

				<Stagger
					viewport={true}
					delay={0.08}
					className="flex flex-wrap justify-center gap-6"
				>
					{FEATURES.map(({ icon: Icon, title, desc }) => (
						<FadeInItem key={title} yOffset={20} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
							<Card
								variant="light"
								className="flex flex-col gap-3 p-8 border border-hairline-cloud rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(106,95,193,0.08)] hover:-translate-y-1 hover:border-accent-violet/30 transition-all duration-300 h-full"
							>
								<div className="size-11 rounded-lg bg-accent-violet/10 flex items-center justify-center text-accent-violet">
									<Icon size={22} />
								</div>
								<h3 className="text-lg font-bold font-display text-ink-deep mt-2">
									{title}
								</h3>
								<p className="text-sm text-muted leading-relaxed">{desc}</p>
							</Card>
						</FadeInItem>
					))}
				</Stagger>
			</div>
		</section>
	);
}
