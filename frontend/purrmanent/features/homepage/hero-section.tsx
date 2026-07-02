'use client';

import Link from 'next/link';
import { Button, Stagger, FadeInItem } from '@/components/ui';
import CircularText from '@/components/CircularText';
import BlurText from '@/components/BlurText';
import ShinyText from '@/components/ShinyText';
import logo from '@/app/assets/logo/logo-1000x1000.png';
import heroMainDecompressionIllustration from '@/app/assets/hero/hero-main-decompression-illustration.png';
import Image from 'next/image';

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

				<FadeInItem
					yOffset={24}
					className="w-full max-w-3xl flex justify-center items-center"
				>
					<Image
						src={heroMainDecompressionIllustration}
						alt="Purrmanent 90-Day Tracker Dashboard Screenshot"
						className="opacity-75 hover:opacity-90 scale-95 hover:scale-100 transition-all duration-300"
						height={500}
						width={500}
					/>
				</FadeInItem>
			</Stagger>
		</section>
	);
}
