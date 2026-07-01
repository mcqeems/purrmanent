'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button, Stagger, FadeInItem } from '@/components/ui';
import CircularText from '@/components/CircularText';
import BlurText from '@/components/BlurText';
import ShinyText from '@/components/ShinyText';
import TiltedCard from '@/components/TiltedCard';
import { MOCK_DASHBOARD_SVG } from './mock-svgs';

export function HeroSection() {
	return (
		<section
			id="hero"
			className="relative overflow-hidden min-h-[98vh] flex items-center justify-center pt-28 pb-20 px-6 text-center bg-surface-canvas-dark"
		>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(106,95,193,0.15),rgba(255,255,255,0))]" />

			<Stagger
				viewport={false}
				delay={0.12}
				className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6"
			>
				<FadeInItem yOffset={8}>
					<ShinyText
						text="90-DAY SCIENTIFIC CAT-PARENT GUIDE"
						className="text-xs font-semibold uppercase tracking-[2px]"
						color="#bdb8c0"
						shineColor="#c2ef4e"
						speed={3}
					/>
				</FadeInItem>

				<FadeInItem yOffset={12}>
					<h1 className="font-display text-5xl font-bold leading-tight sm:text-7.5xl relative max-w-3xl mx-auto">
						The first 90 days of cat adoption{' '}
						<span className="bg-accent-lime text-ink-deep font-bold px-3 py-0.5 rounded-xs inline-block">
							made calm
						</span>
						<CircularText
							text="PURRMANENT • PURRMANENT • "
							spinDuration={12}
							radius={45}
							className="text-xs scale-75 text-accent-lime tracking-[1.5px] font-mono opacity-80 hover:opacity-100 transition-opacity absolute -right-20 -top-20 hidden md:block"
						/>
					</h1>
				</FadeInItem>

				<FadeInItem yOffset={16}>
					<div className="max-w-2xl text-lg md:text-xl text-on-dark-muted leading-[2.0] mt-2">
						<BlurText
							text="Purrmanent transforms the stressful early months of cat adoption into a clear, interactive roadmap based on the scientific 3-3-3 adjustment rule. Get personalized checklists, veterinary health logs, and RAG-backed AI coaching."
							delay={15}
							animateBy="words"
						/>
					</div>
				</FadeInItem>

				<FadeInItem yOffset={20}>
					<div className="flex flex-wrap justify-center gap-4 mt-6">
						<Button
							id="btn-hero-start"
							asChild
							variant="emboss"
							size="lg"
							className="px-8"
						>
							<Link href="/register">Get started free</Link>
						</Button>
						<Button
							id="btn-hero-signin"
							asChild
							variant="emboss"
							size="lg"
							className="px-8 bg-surface-night text-on-primary border border-hairline-violet hover:bg-surface-canvas-dark hover:text-on-primary"
						>
							<Link href="/login">Sign in</Link>
						</Button>
					</div>
				</FadeInItem>

				<FadeInItem yOffset={24} className="w-full mt-12 max-w-3xl relative">
					<div className="absolute -top-12 -right-8 w-24 h-24 bg-accent-pink/15 border border-accent-pink/40 text-accent-pink rounded-full flex flex-col items-center justify-center rotate-12 z-20 font-display font-bold text-xs uppercase shadow-lg select-none hover:rotate-6 hover:scale-105 transition-all duration-300">
						<Sparkles size={20} className="mb-1" />
						<span>Vet Approved</span>
					</div>

					<div className="border border-hairline-violet/60 rounded-xxl p-2 bg-primary/40 backdrop-blur-sm shadow-2xl hover:border-accent-lime/40 transition-colors duration-500">
						<TiltedCard
							imageSrc={MOCK_DASHBOARD_SVG}
							altText="Purrmanent 90-Day Tracker Dashboard Screenshot"
							captionText="Day 12: Building Feeding Routine Checklist"
							containerHeight="400px"
							imageHeight="380px"
							imageWidth="100%"
							scaleOnHover={1.03}
							rotateAmplitude={4}
						/>
					</div>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-8 border-t border-hairline-violet/30 pt-6">
						<div className="text-center sm:text-left">
							<p className="text-2xl font-bold font-display text-accent-lime">
								5,000+
							</p>
							<p className="text-xs text-on-dark-muted font-medium uppercase tracking-wider">
								Cats Graduated
							</p>
						</div>
						<div className="h-8 w-px bg-hairline-violet/30 hidden sm:block" />
						<div className="text-center sm:text-left">
							<p className="text-2xl font-bold font-display text-accent-pink">
								98.4%
							</p>
							<p className="text-xs text-on-dark-muted font-medium uppercase tracking-wider">
								Integration Rate
							</p>
						</div>
						<div className="h-8 w-px bg-hairline-violet/30 hidden sm:block" />
						<div className="text-center sm:text-left">
							<p className="text-2xl font-bold font-display text-on-primary">
								120+
							</p>
							<p className="text-xs text-on-dark-muted font-medium uppercase tracking-wider">
								Partner Shelters
							</p>
						</div>
					</div>
				</FadeInItem>
			</Stagger>
		</section>
	);
}
