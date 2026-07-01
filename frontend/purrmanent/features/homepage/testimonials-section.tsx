import { Star, HeartPulse } from 'lucide-react';
import { Card, FadeInItem } from '@/components/ui';

const TESTIMONIALS = [
	{
		quote: "Milo spent his first 4 days under the kitchen cabinet. Following Purrmanent's Shy Cat Path, we did scent swaps and room transitions. By week 3, he was playing fetch. Today he sleeps right next to my pillow.",
		author: "Sarah Jenkins",
		role: "Adopter of Milo",
		location: "Jakarta, Indonesia",
		stars: 5
	},
	{
		quote: "With a busy household, we were worried Luna would get overwhelmed. The daily checklists gave our kids clear chores, and the AI coach warned us when she was overstimulated. The structure saved us.",
		author: "Budi Santoso",
		role: "Adopter of Luna",
		location: "Bandung, Indonesia",
		stars: 5
	},
	{
		quote: "Adopting a senior cat comes with health challenges. Logged Cleo's weights, vaccine intervals, and got vet reminders. She graduated last week, and our vet was amazed by the detailed records we provided.",
		author: "Rina Wijaya",
		role: "Adopter of Cleo & Vet Assistant",
		location: "Surabaya, Indonesia",
		stars: 5
	}
];

export function TestimonialsSection() {
	return (
		<section id="testimonials" className="bg-surface-night py-24 px-6 border-b border-hairline-violet/30 text-center relative">
			<div className="absolute top-12 left-10 w-28 h-28 hidden lg:flex flex-col items-center justify-center border border-accent-pink/30 bg-accent-pink/5 text-accent-pink rounded-full -rotate-12 p-4 select-none hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
				<HeartPulse size={28} className="text-accent-pink" />
				<span className="text-[10px] font-bold uppercase tracking-wider text-center mt-2">Vet Approved</span>
			</div>

			<div className="mx-auto max-w-5xl">
				<FadeInItem viewport={true} yOffset={20} className="mb-16">
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-pink bg-accent-pink/10 px-3 py-1 rounded-full">
						SUCCESS STORIES
					</span>
					<h2 className="font-display text-3.5xl font-bold text-on-primary mt-4">
						Alumni Integration Stories
					</h2>
					<p className="text-on-dark-muted mt-3 max-w-xl mx-auto text-sm leading-relaxed">
						Read how actual shelter adopters transitioned their cats using Purrmanent&apos;s structured guides.
					</p>
				</FadeInItem>

				<div className="grid gap-6 md:grid-cols-3 text-left">
					{TESTIMONIALS.map((t, idx) => (
						<Card key={idx} variant="featured" className="bg-surface-canvas-dark border border-hairline-violet/60 hover:border-accent-pink/30 transition-colors p-6 flex flex-col justify-between rounded-xl h-full shadow-lg">
							<div>
								<div className="flex items-center gap-1 mb-4 text-accent-lime">
									{[...Array(t.stars)].map((_, i) => (
										<Star key={i} size={14} fill="currentColor" />
									))}
								</div>
								<p className="text-xs text-on-dark-muted italic leading-relaxed mb-6">
									&ldquo;{t.quote}&rdquo;
								</p>
							</div>

							<div className="border-t border-hairline-violet/20 pt-4 flex items-center justify-between">
								<div>
									<p className="text-xs font-bold text-on-primary">{t.author}</p>
									<p className="text-[10px] text-on-dark-muted">{t.role}</p>
								</div>
								<span className="text-[9px] text-accent-violet font-semibold">{t.location}</span>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
