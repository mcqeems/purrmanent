import { Check } from 'lucide-react';
import {
	Button,
	Card,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	FadeInItem,
} from '@/components/ui';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import shyCatHiding from '@/app/assets/home/shy-cat-hiding.png';
import activeCatLeaping from '@/app/assets/home/active-cat-leaping.png';
import balancedCatWalking from '@/app/assets/home/balanced-cat-walking.png';

const PATH_SHY_STEPS = [
	{
		stage: 'Stage 1: Basecamp Isolation (Days 1-7)',
		detail:
			'Keep inside one small quiet bedroom. Do not force interaction. Let them decompress.',
	},
	{
		stage: 'Stage 2: Passive Presence (Days 8-14)',
		detail:
			'Sit in the room reading or working. Feed wet food nearby to build positive associations.',
	},
	{
		stage: 'Stage 3: Scent Exchanging (Weeks 3-4)',
		detail:
			'Rub a clean towel on the cat and place it in the living room, and vice versa.',
	},
	{
		stage: 'Stage 4: Controlled Access (Months 2-3)',
		detail:
			'Crack the door open with baby gates. Let them explore room-by-room slowly.',
	},
];

const PATH_BOLD_STEPS = [
	{
		stage: 'Stage 1: Controlled Territory (Days 1-3)',
		detail:
			'Establish quiet base, but allow immediate exploration of adjoining safe corridors.',
	},
	{
		stage: 'Stage 2: Interactive Play (Weeks 1-3)',
		detail:
			'Perform 3 high-intensity sessions daily with wand toys to drain stalking energy.',
	},
	{
		stage: 'Stage 3: Vertical Enrichment (Weeks 4-6)',
		detail:
			'Install cat trees and window perches. Bold cats need high vantage points.',
	},
	{
		stage: 'Stage 4: Puzzle Feeders (Months 2-3)',
		detail:
			'Introduce slow-feeder balls and clicker tricks to stimulate their intelligent brains.',
	},
];

const PATH_BALANCED_STEPS = [
	{
		stage: 'Stage 1: Standard Basecamp (Days 1-3)',
		detail:
			'Secure quiet room with litter, food, and water. Build feeding schedule.',
	},
	{
		stage: 'Stage 2: Room Expansion (Weeks 1-2)',
		detail:
			'Open basecamp door during quiet hours. Let cat explore at their own leisure.',
	},
	{
		stage: 'Stage 3: Interactive Bonding (Weeks 3-4)',
		detail:
			'Introduce toys, gentle brushing sessions, and begin regular grooming habits.',
	},
	{
		stage: 'Stage 4: Full Roaming (Months 2-3)',
		detail:
			'Integrate full access. Solidify vertical scratchers, litter spots, and sleeping nooks.',
	},
];

// ponytail: three path cards share the same layout, extracted the repeated inner markup into a helper
function PathCard({
	label,
	title,
	desc,
	steps,
	outcome,
	support,
	btnId,
	btnLabel,
	illustration,
	illustrationName,
	illustrationDesc,
	illustrationPrompt,
}: {
	label: string;
	title: string;
	desc: string;
	steps: { stage: string; detail: string }[];
	outcome: string;
	support: string[];
	btnId: string;
	btnLabel: string;
	illustration: StaticImageData;
	illustrationName: string;
	illustrationDesc: string;
	illustrationPrompt: string;
}) {
	return (
		<Card
			variant="light"
			className="p-8 border border-hairline-cloud rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
		>
			<div className="grid gap-8 md:grid-cols-3">
				<div className="md:col-span-2 space-y-6">
					<div className="flex flex-col sm:flex-row justify-between gap-4">
						<div className="flex-1">
							<span className="text-[10px] uppercase font-bold text-accent-violet tracking-wider">
								{label}
							</span>
							<h3 className="font-display text-2xl font-bold text-ink-deep mt-1">
								{title}
							</h3>
							<p className="text-xs text-muted leading-relaxed mt-2">{desc}</p>
						</div>
					</div>
					<div className="space-y-4">
						<p className="text-xs font-bold text-ink-deep uppercase tracking-wider">
							Mandatory Phases:
						</p>
						<div className="space-y-3">
							{steps.map((s, idx) => (
								<div key={idx} className="flex gap-3 items-start text-xs">
									<div className="size-5 rounded-full bg-accent-violet/10 text-accent-violet flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
										{idx + 1}
									</div>
									<div>
										<p className="font-bold text-ink-deep">{s.stage}</p>
										<p className="text-muted text-[11px] mt-0.5">{s.detail}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex flex-col justify-between bg-surface-press-light/30 border border-hairline-cloud rounded-xl p-6 h-full">
					{/*<div className="space-y-4">
						<div>
							<p className="text-[10px] text-muted uppercase font-bold tracking-wider">Outcome Focus</p>
							<p className="text-sm font-bold text-ink-deep mt-1">{outcome}</p>
						</div>
						<div className="h-px bg-hairline-cloud" />
						<div>
							<p className="text-[10px] text-muted uppercase font-bold tracking-wider">Included Support</p>
							<ul className="space-y-1.5 mt-2">
								{support.map((s) => (
									<li key={s} className="text-[11px] text-muted flex items-center gap-1.5"><Check size={12} className="text-accent-violet" /> {s}</li>
								))}
							</ul>
						</div>
					</div>*/}
					{/*
						IMAGE PLACEHOLDER: Path Illustration
						Description: {illustrationDesc}
						Prompt for Image Generation Model:
						{illustrationPrompt}
					*/}
					<div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
						<Image
							src={illustration}
							alt={illustrationName}
							className="object-contain w-full h-full"
						/>
					</div>
					<div className="mt-8">
						<Button id={btnId} asChild variant="emboss" className="w-full">
							<Link href="/register">{btnLabel}</Link>
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}

export function PersonalityPathsSection() {
	return (
		<section
			id="personality-paths"
			className="bg-surface-canvas-light py-24 text-ink-deep border-b border-hairline-cloud"
		>
			<div className="mx-auto max-w-5xl px-6">
				<FadeInItem
					viewport={true}
					yOffset={20}
					className="text-center mb-16 max-w-2xl mx-auto"
				>
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
						PERSONALIZED PATHS
					</span>
					<h2 className="font-display text-4xl font-bold text-ink-deep mt-4">
						Choose your cat&apos;s adaptation track
					</h2>
					<p className="text-muted mt-3 text-base leading-relaxed">
						We structure 3 personality tracks. Complete the onboarding
						questionnaire to verify which path fits your newly adopted feline.
					</p>
				</FadeInItem>

				<Tabs defaultValue="shy" className="w-full">
					<div className="flex justify-center mb-10">
						<TabsList className="grid w-full max-w-md grid-cols-3 bg-surface-press-light border border-hairline-cloud p-1 rounded-xl">
							<TabsTrigger
								id="tab-shy"
								value="shy"
								className="py-2.5 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-ink-deep data-[state=active]:shadow-sm"
							>
								Shy / Fearful
							</TabsTrigger>
							<TabsTrigger
								id="tab-bold"
								value="bold"
								className="py-2.5 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-ink-deep data-[state=active]:shadow-sm"
							>
								Bold / Active
							</TabsTrigger>
							<TabsTrigger
								id="tab-balanced"
								value="balanced"
								className="py-2.5 rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-ink-deep data-[state=active]:shadow-sm"
							>
								Balanced Cat
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="shy">
						<PathCard
							label="Plan Option 1"
							title="The Shy/Fearful Cat Path"
							desc="Designed for shelter cats that hide, freeze, or avoid human presence. Focuses heavily on basecamp restriction, scent swaps, and gradual confidence building."
							steps={PATH_SHY_STEPS}
							outcome="Confident explorer, trusts adopters, vocalizing needs."
							support={[
								'24/7 AI Behavior Coach',
								'Decompression checklist',
								'Medical logs',
							]}
							btnId="btn-shy-activate"
							btnLabel="Activate Shy Plan"
							illustration={shyCatHiding}
							illustrationName="Shy Cat Hiding"
							illustrationDesc="A shy cat peeking out from behind a curtain."
							illustrationPrompt='"A hand-drawn pencil sketch and watercolor wash illustration of a shy cat hiding behind a curtain, peeking out, soft colors, white background, simple outline doodle. Purrmanent theme: accent lime #c2ef4e and violet #6a5fc1 as dominant tones, must work on dark #1f1633 and light #ffffff backgrounds --no 3d render, photorealistic"'
						/>
					</TabsContent>

					<TabsContent value="bold">
						<PathCard
							label="Plan Option 2"
							title="The Bold/Active Cat Path"
							desc="Designed for highly active, loud, or younger felines. Focuses on preventing boredom-related biting, establishing play boundaries, and installing vertical climbing zones."
							steps={PATH_BOLD_STEPS}
							outcome="Drained energy, zero scratching on couches, puzzle master."
							support={[
								'Play stimulation timers',
								'Escape-proofing guide',
								'Activity log',
							]}
							btnId="btn-bold-activate"
							btnLabel="Activate Bold Plan"
							illustration={activeCatLeaping}
							illustrationName="Active Cat Leaping"
							illustrationDesc="An active cat leaping in the air catching a feather toy."
							illustrationPrompt='"A hand-drawn pencil sketch and watercolor wash illustration of an active cat leaping in the air catching a feather toy, soft colors, white background, simple outline doodle. Purrmanent theme: accent lime #c2ef4e and violet #6a5fc1 as dominant tones, must work on dark #1f1633 and light #ffffff backgrounds --no 3d render, photorealistic"'
						/>
					</TabsContent>

					<TabsContent value="balanced">
						<PathCard
							label="Plan Option 3"
							title="The Confident/Balanced Cat Path"
							desc="Designed for felines showing standard stress levels. Follows the default 3-3-3 rule framework to expand roaming spaces, build brushing routines, and establish permanent scratching posts."
							steps={PATH_BALANCED_STEPS}
							outcome="Comfortable grooming, full household integration, stable routine."
							support={[
								'Grooming tracker logs',
								'Standard 3-3-3 template',
								'AI Behavior support',
							]}
							btnId="btn-balanced-activate"
							btnLabel="Activate Balanced Plan"
							illustration={balancedCatWalking}
							illustrationName="Balanced Cat Walking"
							illustrationDesc="A happy cat walking forward confidently with its tail up."
							illustrationPrompt='"A hand-drawn pencil sketch and watercolor wash illustration of a happy cat walking forward confidently, tail up, soft colors, white background, simple outline doodle. Purrmanent theme: accent lime #c2ef4e and violet #6a5fc1 as dominant tones, must work on dark #1f1633 and light #ffffff backgrounds --no 3d render, photorealistic"'
						/>
					</TabsContent>
				</Tabs>
			</div>
		</section>
	);
}
