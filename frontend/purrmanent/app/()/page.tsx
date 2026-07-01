import { HeroSection } from '@/features/homepage/hero-section';
import { WhySection } from '@/features/homepage/why-section';
import { OnboardingSection } from '@/features/homepage/onboarding-section';
import { TimelineSection } from '@/features/homepage/timeline-section';
import { ReadinessSection } from '@/features/homepage/readiness-section';
import { PersonalityPathsSection } from '@/features/homepage/personality-paths-section';
import { GraduatesSection } from '@/features/homepage/graduates-section';
import { CtaSection } from '@/features/homepage/cta-section';

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary">
			<HeroSection />
			<WhySection />
			<OnboardingSection />
			<TimelineSection />
			<ReadinessSection />
			<PersonalityPathsSection />
			<GraduatesSection />
			<CtaSection />
		</div>
	);
}
