import type { Metadata } from 'next';
import { HeroSection } from '@/features/homepage/hero-section';
import { WhySection } from '@/features/homepage/why-section';
import { OnboardingSection } from '@/features/homepage/onboarding-section';
import { AiCoachSection } from '@/features/homepage/ai-coach-section';
import { TimelineSection } from '@/features/homepage/timeline-section';
import { ReadinessSection } from '@/features/homepage/readiness-section';
import { PersonalityPathsSection } from '@/features/homepage/personality-paths-section';
import { CtaSection } from '@/features/homepage/cta-section';

export const metadata: Metadata = {
	title: {
		absolute: "Purrmanent — Your Cat's Permanent Home",
	},
	description:
		'Purrmanent guides new cat parents through the critical 90-day adjustment period with daily checklists, health tracking, and AI coaching.',
	openGraph: {
		title: "Purrmanent — Your Cat's Permanent Home",
		description:
			'Purrmanent guides new cat parents through the critical 90-day adjustment period with daily checklists, health tracking, and AI coaching.',
		url: 'https://purrmanent.web.id',
	},
};

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary">
			<HeroSection />
			<WhySection />
			<OnboardingSection />
			<AiCoachSection />
			<TimelineSection />
			<ReadinessSection />
			<PersonalityPathsSection />
			<CtaSection />
		</div>
	);
}
