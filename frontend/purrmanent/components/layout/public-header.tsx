'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui';
import logo from '@/app/assets/logo/logo-1000x1000.png';

const NAV_ITEMS = [
	{ name: 'Why Us', href: '#why-us' },
	{ name: 'How It Works', href: '#onboarding-steps' },
	{ name: 'Timeline', href: '#timeline' },
	{ name: 'Readiness', href: '#readiness-checklists' },
	{ name: 'Paths', href: '#personality-paths' },
	{ name: 'Graduates', href: '#graduates-portfolio' }
];

export function PublicHeader() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 border-b border-hairline-violet/10 bg-surface-canvas-dark/80 backdrop-blur-lg transition-all duration-300">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				{/* Brand Logo & Name */}
				<Link
					href="/"
					className="flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
				>
					<div className="p-1 bg-surface-canvas-light rounded-lg group-hover:shadow-[0_0_12px_rgba(194,239,78,0.2)] transition-shadow">
						<Image
							src={logo}
							alt="Purrmanent Logo"
							width={24}
							height={24}
							className="rounded-sm"
						/>
					</div>
					<span className="font-display text-lg font-bold text-on-primary group-hover:text-accent-lime transition-colors">
						Purrmanent
					</span>
				</Link>

				{/* Desktop Central Links (Dicoding Asah style) */}
				<nav className="hidden md:flex items-center gap-7">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="relative group text-xs font-bold uppercase tracking-[1.2px] text-on-dark-muted hover:text-on-primary py-1.5 transition-colors duration-200"
						>
							{item.name}
							{/* Hover underline bar animation */}
							<span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-accent-lime transition-all duration-300 group-hover:w-full group-hover:left-0" />
						</Link>
					))}
				</nav>

				{/* Desktop Right CTAs */}
				<div className="hidden md:flex items-center gap-5">
					<Link
						href="/login"
						className="text-xs font-bold uppercase tracking-[1.2px] text-on-dark-muted hover:text-on-primary transition-colors duration-200"
					>
						Sign in
					</Link>
					<Button
						asChild
						variant="emboss"
						size="sm"
						className="px-5"
					>
						<Link href="/register">Get started</Link>
					</Button>
				</div>

				{/* Mobile Hamburger Toggle Button */}
				<button
					id="btn-mobile-menu-toggle"
					onClick={() => setIsOpen(!isOpen)}
					className="flex md:hidden items-center justify-center p-2 rounded-lg text-on-dark-muted hover:text-on-primary hover:bg-on-dark-faint/30 transition-all duration-200"
					aria-label="Toggle Navigation Menu"
				>
					{isOpen ? <X size={20} className="text-accent-lime animate-pm-fade-in" /> : <Menu size={20} />}
				</button>
			</div>

			{/* Mobile Menu Drawer Overlay */}
			{isOpen && (
				<div className="md:hidden absolute top-full left-0 right-0 border-t border-b border-hairline-violet/30 bg-surface-canvas-dark/95 backdrop-blur-xl shadow-2xl transition-all duration-300">
					<nav className="flex flex-col gap-4 px-6 py-6">
						{NAV_ITEMS.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className="text-sm font-bold uppercase tracking-[1.5px] text-on-dark-muted hover:text-accent-lime py-2 border-b border-hairline-violet/10 transition-colors duration-200"
							>
								{item.name}
							</Link>
						))}

						<div className="flex flex-col gap-3 pt-4">
							<Link
								href="/login"
								onClick={() => setIsOpen(false)}
								className="text-sm font-bold uppercase tracking-[1.5px] text-on-dark-muted hover:text-on-primary text-center py-2.5 border border-hairline-violet/30 rounded-lg hover:bg-on-dark-faint/10 transition-all duration-200"
							>
								Sign in
							</Link>
							<Button
								asChild
								variant="emboss"
								className="w-full text-center"
							>
								<Link href="/register" onClick={() => setIsOpen(false)}>Get started</Link>
							</Button>
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}
