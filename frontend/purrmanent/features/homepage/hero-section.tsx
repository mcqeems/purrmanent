'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button, Stagger, FadeInItem } from '@/components/ui';
import CircularText from '@/components/CircularText';
import BlurText from '@/components/BlurText';
import ShinyText from '@/components/ShinyText';
import TiltedCard from '@/components/TiltedCard';
import { MOCK_DASHBOARD_SVG } from './mock-svgs';
import logo from '@/app/assets/logo/logo-1000x1000.png';

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
							className="text-xs scale-75 text-accent-lime tracking-[1.5px] font-mono opacity-80 hover:opacity-100 transition-opacity absolute right-2 -top-25 hidden md:block"
							image={logo}
						/>
					</h1>
				</FadeInItem>

				<FadeInItem yOffset={16}>
					<div className="max-w-2xl text-lg md:text-xl text-on-dark-muted leading-[2.0] mt-2">
						<BlurText
							text="Purrmanent transforms the stressful early months of cat adoption into a clear, interactive roadmap based on the scientific 3-3-3 adjustment rule."
							delay={15}
							animateBy="words"
							className="flex justify-center items-center"
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
					{/*
						IMAGE PLACEHOLDER: Vet Approved Stamp
						Description: A circular hand-drawn stamp emblem of a veterinary cross with cat ears, sketchy pencil texture, watercolor wash, warm green/lime tone.
						Prompt for Image Generation Model:
						"A circular hand-drawn stamp emblem of a veterinary cross with cat ears, sketchy pencil texture, watercolor wash, warm electric lime tone, white background, clean stamp outline, Sentry-style color palette --no text"
					*/}
					<div className="absolute -top-12 -right-8 w-24 h-24 bg-surface-canvas-dark border-2 border-dashed border-accent-lime/40 text-accent-lime rounded-full flex flex-col items-center justify-center rotate-12 z-20 font-display font-bold text-xs uppercase shadow-[0_0_15px_rgba(194,239,78,0.15)] select-none hover:rotate-6 hover:scale-105 transition-all duration-300">
						<Sparkles
							size={20}
							className="mb-1 text-accent-lime animate-pulse"
						/>
						<span className="text-[9px] tracking-wider text-center px-2 font-mono">
							Vet Approved
						</span>
					</div>

					{/*
						IMAGE PLACEHOLDER: Hero Main Decompression Illustration
						Description: A cozy hand-drawn sketch illustration of an adopter slow-blinking at a cat in a living room, soft colored pencil and watercolor wash texture.
						Prompt for Image Generation Model:
						"A minimalist hand-drawn pencil sketch and watercolor wash illustration of a person sitting on a rug slow-blinking at a tabby cat, cozy living room background, soft colors, loose lines, white background, premium vector look --no 3d render, photorealistic"
					*/}
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
