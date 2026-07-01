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
			{/* 
				IMAGE PLACEHOLDER: "Safe Space First" Cat Sticker
				Description: A hand-drawn sticker badge showing a curled-up cat sleeping inside a heart outline, textured pencil sketch and watercolor wash, warm pinkish tones.
				Prompt for Image Generation Model: 
				"A hand-made sticker badge showing a curled-up sleeping cat inside a heart line frame, pencil sketch and watercolor wash texture, soft warm pink tone, white background, sketchy border outline --no text"
			*/}
			<div className="absolute top-12 right-12 w-28 h-28 hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-accent-pink/30 bg-surface-canvas-light text-accent-pink rounded-full rotate-6 p-4 select-none hover:rotate-0 hover:scale-105 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
				<Heart size={28} className="text-accent-pink fill-accent-pink/20 animate-pulse" />
				<span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-ink-deep font-mono text-center">Safe Space</span>
			</div>

			<div className="mx-auto max-w-6xl px-6">
				<div className="grid md:grid-cols-3 gap-8 items-center mb-16">
					<FadeInItem viewport={true} yOffset={20} className="md:col-span-2 text-left space-y-4">
						<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full inline-block">
							WHY PURRMANENT?
						</span>
						<h2 className="font-display text-4xl font-bold text-ink-deep">
							Everything you need to guide your cat home
						</h2>
						<p className="text-muted text-base leading-relaxed max-w-xl">
							Interactive tools and vet-approved schedules designed to make decompression stress-free for both cat and parent.
						</p>
					</FadeInItem>

					{/* 
						IMAGE PLACEHOLDER: Cat in Cardboard Box Illustration
						Description: A minimalist sketch of a content cat sitting inside a cozy cardboard box, colored-pencil texture.
						Prompt for Image Generation Model: 
						"A minimalist hand-drawn pencil sketch and watercolor wash illustration of a happy cat sitting inside a cardboard box, soft warm tones, white background, premium vector look --no 3d render"
					*/}
					<FadeInItem viewport={true} yOffset={20} className="md:col-span-1 flex justify-center">
						<div className="w-full max-w-[240px] h-[160px] border-2 border-dashed border-accent-violet/30 rounded-2xl bg-surface-press-light/35 flex flex-col items-center justify-center p-4 hover:border-accent-violet/50 transition-colors duration-300">
							<div className="size-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet mb-2">
								<Heart size={18} className="fill-accent-violet/20" />
							</div>
							<span className="text-[10px] font-bold uppercase tracking-wider text-ink-deep text-center font-mono">
								Illustration Space:
							</span>
							<span className="text-[9px] text-muted text-center leading-normal mt-1 max-w-[180px]">
								Cat in Cardboard Box
							</span>
						</div>
					</FadeInItem>
				</div>

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
