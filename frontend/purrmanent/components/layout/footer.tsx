import Image from 'next/image';
import logo from '@/app/assets/logo/logo-1000x1000.png';
import Link from 'next/link';

export function Footer() {
	return (
		<footer className="mt-2 bg-surface-canvas-light">
			<svg
				aria-hidden
				viewBox="0 0 1200 12"
				preserveAspectRatio="none"
				className="h-8 w-full text-accent-lime"
			>
				<path
					d="M0 6 Q 30 0 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6 T 900 6 T 960 6 T 1020 6 T 1080 6 T 1140 6 T 1200 6"
					fill="none"
					stroke="currentColor"
					strokeWidth="5"
				/>
			</svg>
			<div className="max-w-6xl mx-auto py-8 mb-4 px-6 flex flex-row border-b border-hairline-cloud">
				<div className="flex flex-col gap-1 text-sm text-ink-deep">
					<Link
						href="/"
						className="flex items-center gap-2.5 transition-transform duration-200"
					>
						<div className="p-1 bg-accent-lime rounded-lg group-hover:shadow-[0_0_12px_rgba(194,239,78,0.2)] transition-all">
							<Image
								src={logo}
								alt="Purrmanent Logo"
								width={22}
								height={22}
								className="rounded-sm"
							/>
						</div>
						<span className="font-display text-base font-bold text-surface-canvas-dark transition-colors">
							Purrmanent
						</span>
					</Link>{' '}
					<p className="text-muted">90 days to a happy, settled cat.</p>
					<p className="mt-4 text-xs text-muted">
						© {new Date().getFullYear()} Purrmanent.
					</p>
				</div>
			</div>
		</footer>
	);
}
