const PARTNERS = [
	{ name: 'Humane Society Alliance', location: 'Jakarta Chapter' },
	{ name: 'Paws & Whiskers Rescue', location: 'Bandung Hub' },
	{ name: 'Feline Shelter Foundation', location: 'Surabaya Unit' },
	{ name: 'Stray Safe Sanctuary', location: 'Yogyakarta Group' },
	{ name: 'Happy Trails Pet Adoption', location: 'Medan Branch' }
];

export function PartnersStrip() {
	return (
		<section id="partners-strip" className="bg-surface-night py-8 border-y border-hairline-violet/20 overflow-hidden">
			<div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
				<p className="text-xs font-semibold uppercase tracking-[1.5px] text-on-dark-muted shrink-0">
					Supported by Progressive Rescues:
				</p>
				<div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
					{PARTNERS.map((p) => (
						<div key={p.name} className="flex flex-col items-center opacity-40 hover:opacity-95 hover:scale-[1.02] transition-all duration-300 select-none cursor-default">
							<span className="font-display font-bold text-sm tracking-tight text-on-primary">{p.name}</span>
							<span className="text-[9px] uppercase tracking-wider text-accent-violet">{p.location}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
