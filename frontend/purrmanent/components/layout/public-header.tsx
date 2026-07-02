'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import logo from '@/app/assets/logo/logo-1000x1000.png';

const NAV_ITEMS = [
	{ name: 'Why Us', href: '#why-us' },
	{ name: 'How It Works', href: '#onboarding-steps' },
	{ name: 'Timeline', href: '#timeline' },
	{ name: 'Readiness', href: '#readiness-checklists' },
	{ name: 'Paths', href: '#personality-paths' },
	{ name: 'Graduates', href: '#graduates-portfolio' },
];

export function PublicHeader() {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setMounted(true);
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth >= 768) {
				setIsOpen(false);
			}
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Render skeleton capsule placeholder during server-side render to prevent hydration flicker
	if (!mounted) {
		return (
			<header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 bg-surface-canvas-dark/80 backdrop-blur-lg border border-hairline-violet/15 rounded-full h-[62px]" />
		);
	}

	const containerVariants = {
		collapsed: {
			height: '62px',
			borderRadius: '31px',
			transition: {
				duration: 0.35,
				ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
			},
		},
		expanded: {
			height: 'auto',
			borderRadius: '28px',
			transition: {
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
			},
		},
	};

	return (
		<motion.header
			variants={containerVariants}
			initial={false}
			animate={
				isMobile
					? isOpen
						? 'expanded'
						: 'collapsed'
					: { height: '62px', borderRadius: '9999px' }
			}
			className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 bg-surface-canvas-dark/80 backdrop-blur-lg border border-hairline-violet/15 shadow-2xl overflow-hidden"
		>
			{isMobile ? (
				<div className="flex flex-col px-6 py-4">
					{/* Top Header Bar */}
					<div className="flex items-center justify-between h-[30px]">
						{/* Brand Logo & Name */}
						<Link
							href="/"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2.5"
						>
							<div className="p-0.5 bg-surface-canvas-light rounded-md">
								<Image
									src={logo}
									alt="Purrmanent Logo"
									width={20}
									height={20}
									className="rounded-sm"
								/>
							</div>
							<span className="font-display text-sm font-bold text-white tracking-[0.5px]">
								Purrmanent
							</span>
						</Link>

						{/* Custom 2-Line Morphing Toggle Button */}
						<button
							id="btn-mobile-menu-toggle"
							onClick={() => setIsOpen(!isOpen)}
							className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
							aria-label="Toggle Navigation Menu"
						>
							<div className="flex flex-col gap-1.5 justify-center items-end w-5 h-5">
								<span
									className={`h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${
										isOpen ? 'rotate-45 translate-y-[5px] w-5' : 'w-5'
									}`}
								/>
								<span
									className={`h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${
										isOpen ? '-rotate-45 -translate-y-[3px] w-5' : 'w-3.5'
									}`}
								/>
							</div>
						</button>
					</div>

					{/* Expanding Menu Contents */}
					<AnimatePresence>
						{isOpen && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.25, ease: 'easeOut' }}
								className="flex flex-col gap-5 pt-8 pb-4"
							>
								{NAV_ITEMS.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className="text-sm font-bold uppercase tracking-[1.5px] text-white/80 hover:text-accent-lime py-1 border-b border-white/5 transition-colors"
									>
										{item.name}
									</Link>
								))}

								<div className="flex flex-col gap-4 pt-4 border-t border-white/5">
									<Link
										href="/login"
										onClick={() => setIsOpen(false)}
										className="text-sm font-bold uppercase tracking-[1.5px] text-white/80 hover:text-white text-center py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
									>
										Sign in
									</Link>
									<Button
										asChild
										variant="emboss"
										className="w-full text-center py-3 font-bold uppercase tracking-[1.5px] text-sm"
									>
										<Link href="/register" onClick={() => setIsOpen(false)}>
											Get started
										</Link>
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			) : (
				/* Desktop Layout (Standard Capsule Navigation) */
				<div className="flex items-center justify-between px-8 py-3.5 h-[62px]">
					{/* Brand Logo & Name */}
					<Link
						href="/"
						className="flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
					>
						<div className="p-1 bg-surface-canvas-light group-hover:bg-accent-lime rounded-lg group-hover:shadow-[0_0_12px_rgba(194,239,78,0.2)] transition-all">
							<Image
								src={logo}
								alt="Purrmanent Logo"
								width={22}
								height={22}
								className="rounded-sm"
							/>
						</div>
						<span className="font-display text-base font-bold text-white group-hover:text-accent-lime transition-colors">
							Purrmanent
						</span>
					</Link>

					{/* Desktop Central Links */}
					<nav className="flex items-center gap-7">
						{NAV_ITEMS.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className="relative group text-xs font-bold uppercase tracking-[1.2px] text-white/80 hover:text-white py-1.5 transition-colors duration-200"
							>
								{item.name}
								{/* Hover underline bar animation */}
								<span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-accent-lime transition-all duration-300 group-hover:w-full group-hover:left-0" />
							</Link>
						))}
					</nav>

					{/* Desktop Right CTAs */}
					<div className="flex items-center gap-5">
						<Link
							href="/login"
							className="text-xs font-bold uppercase tracking-[1.2px] text-white/70 hover:text-white transition-colors duration-200"
						>
							Sign in
						</Link>
						<Button asChild variant="emboss" size="sm" className="px-5">
							<Link href="/register">Get started</Link>
						</Button>
					</div>
				</div>
			)}
		</motion.header>
	);
}
