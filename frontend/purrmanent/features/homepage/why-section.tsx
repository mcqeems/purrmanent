import {
	Sparkles,
	HeartPulse,
	Trophy,
	ClipboardList,
	ShieldCheck,
	Building,
	Heart,
} from 'lucide-react';
import { Card, Stagger, FadeInItem } from '@/components/ui';
import Image from 'next/image';
import catInCardboard from '@/app/assets/hero/cat-in-cardboard-box-illustration.png';

const FEATURES = [
	{
		icon: Building,
		title: 'Sponsored by Shelters',
		desc: 'Free for adopters. Progressive shelters license Purrmanent to guide adopters and actively reduce shelter return rates.',
	},
	{
		icon: ClipboardList,
		title: 'Structured 90-Day Roadmap',
		desc: 'A day-by-day interactive roadmap customized around the scientific 3-3-3 decompression rule of shelter cats.',
	},
	{
		icon: ShieldCheck,
		title: 'Expert & Vet-Reviewed Content',
		desc: 'Every milestone checklist, body language guide, and decompression protocol is vetted by board-certified veterinarians.',
	},
	{
		icon: Sparkles,
		title: 'AI Behaviorist Copilot',
		desc: '24/7 floating chat assistant backed by vet-reviewed behavior documents. Support @mention commands to reference Kanban tasks.',
	},
	{
		icon: HeartPulse,
		title: 'Interactive Health Log',
		desc: 'Track weight trends, vaccinations, deworming cycles, and set automated reminders to ensure health compliance.',
	},
	{
		icon: Trophy,
		title: 'Gamification & Graduation',
		desc: 'Earn points and unlock badges in real-time as you complete checklist tasks. Receive a digital printable certificate on Day 90.',
	},
];

export function WhySection() {
	return (
		<section
			id="why-us"
			className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud relative"
		>
			<div className="mx-auto max-w-6xl px-6">
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
							Everything you need to guide your cat home
						</h2>
						<p className="text-muted text-base leading-relaxed max-w-xl">
							Interactive tools and vet-approved schedules designed to make
							decompression stress-free for both cat and parent.
						</p>
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
					className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{FEATURES.map(({ icon: Icon, title, desc }) => (
						<FadeInItem key={title} yOffset={20} className="h-full">
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
