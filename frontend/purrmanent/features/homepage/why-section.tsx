import {
	Sparkles,
	HeartPulse,
	Trophy,
	ClipboardList,
	ShieldCheck,
	Building,
	Heart
} from 'lucide-react';
import { Card, Stagger, FadeInItem } from '@/components/ui';

const FEATURES = [
	{
		icon: Building,
		title: 'Sponsored by Shelters',
		desc: 'Free for adopters. Progressive shelters license Purrmanent to guide adopters and actively reduce shelter return rates.'
	},
	{
		icon: ClipboardList,
		title: 'Structured 90-Day Roadmap',
		desc: 'A day-by-day interactive roadmap customized around the scientific 3-3-3 decompression rule of shelter cats.'
	},
	{
		icon: ShieldCheck,
		title: 'Expert & Vet-Reviewed Content',
		desc: 'Every milestone checklist, body language guide, and decompression protocol is vetted by board-certified veterinarians.'
	},
	{
		icon: Sparkles,
		title: 'AI Behaviorist Copilot',
		desc: '24/7 floating chat assistant backed by vet-reviewed behavior documents. Support @mention commands to reference Kanban tasks.'
	},
	{
		icon: HeartPulse,
		title: 'Interactive Health Log',
		desc: 'Track weight trends, vaccinations, deworming cycles, and set automated reminders to ensure health compliance.'
	},
	{
		icon: Trophy,
		title: 'Gamification & Graduation',
		desc: 'Earn points and unlock badges in real-time as you complete checklist tasks. Receive a digital printable certificate on Day 90.'
	}
];

export function WhySection() {
	return (
		<section id="why-us" className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud relative">
			<div className="absolute top-12 right-12 w-28 h-28 hidden lg:flex flex-col items-center justify-center border border-accent-lime/30 bg-accent-lime/5 text-accent-violet rounded-2xl rotate-6 p-4 select-none hover:rotate-0 hover:scale-105 transition-all duration-300">
				<Heart size={28} className="text-accent-pink fill-accent-pink/20 animate-pulse" />
				<span className="text-[10px] font-bold uppercase tracking-wider mt-2 text-ink-deep">Safe Space First</span>
			</div>

			<div className="mx-auto max-w-6xl px-6">
				<FadeInItem viewport={true} yOffset={20} className="text-center mb-16 max-w-2xl mx-auto">
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
						WHY PURRMANENT?
					</span>
					<h2 className="font-display text-4xl font-bold text-ink-deep mt-4">
						Everything you need to guide your cat home
					</h2>
					<p className="text-muted mt-3 text-base leading-relaxed">
						Interactive tools and vet-approved schedules designed to make decompression stress-free for both cat and parent.
					</p>
				</FadeInItem>

				<Stagger viewport={true} delay={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{FEATURES.map(({ icon: Icon, title, desc }) => (
						<FadeInItem key={title} yOffset={20} className="h-full">
							<Card variant="light" className="flex flex-col gap-3 p-8 border border-hairline-cloud rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(106,95,193,0.08)] hover:-translate-y-1 hover:border-accent-violet/30 transition-all duration-300 h-full">
								<div className="size-11 rounded-lg bg-accent-violet/10 flex items-center justify-center text-accent-violet">
									<Icon size={22} />
								</div>
								<h3 className="text-lg font-bold font-display text-ink-deep mt-2">{title}</h3>
								<p className="text-sm text-muted leading-relaxed">{desc}</p>
							</Card>
						</FadeInItem>
					))}
				</Stagger>
			</div>
		</section>
	);
}
