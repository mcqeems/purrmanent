'use client';

import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import logo from '@/app/assets/logo/logo-1000x1000.png';
import { useSession } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export default function AuthLayout({ children }: { children: ReactNode }) {
	const { data, isPending } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && data) {
			router.push('/dashboard');
		}
	}, [data, isPending, router]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-canvas-dark px-4 py-12 text-on-primary">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
			>
				<Link href="/" className="flex items-center gap-2.5">
					<div className="p-1 bg-accent-lime rounded-lg">
						<Image
							src={logo}
							alt="Purrmanent Logo"
							width={22}
							height={22}
							className="rounded-sm"
						/>
					</div>
					<span className="font-display text-xl font-bold">Purrmanent</span>
				</Link>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: 'easeOut' }}
				className="w-full max-w-sm rounded-xl bg-surface-night p-6 sm:p-8"
			>
				{children}
			</motion.div>
		</div>
	);
}
