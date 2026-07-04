'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { useSession } from '@/lib/auth/client';
import { motion, AnimatePresence } from 'motion/react';
import { useCopilot } from './copilot-provider';

const SUGGESTIONS = [
	'How often should I feed my cat?',
	'Add a new cat',
	'What should I do today?',
];

export function DashboardAsk() {
	const router = useRouter();
	const { data: session } = useSession();
	const { newChat, send } = useCopilot();
	const [value, setValue] = useState('');
	const [showGradient, setShowGradient] = useState(false);

	useEffect(() => {
		const checkSize = () => {
			setShowGradient(window.innerWidth >= 640);
		};
		checkSize();
		window.addEventListener('resize', checkSize);
		return () => window.removeEventListener('resize', checkSize);
	}, []);

	function submit(text: string) {
		const t = text.trim();
		if (!t) return;
		setValue('');
		newChat();
		void send(t);
		router.push('/coach');
	}

	const firstName = session?.user?.name
		? session.user.name.split(' ')[0]
		: 'Mustaqim';
	const [greeting, setGreeting] = useState('');

	useEffect(() => {
		const GREETINGS = [
			'Where should we start?',
			'Any new cat?',
			`Hi ${firstName}, what's on your mind?`,
			'Got any questions?',
			`Got a new kitty?`,
		];
		const rand = Math.floor(Math.random() * GREETINGS.length);
		setGreeting(GREETINGS[rand]);
	}, [firstName]);

	return (
		<div data-tour="ask" className="relative mb-8 bg-transparent p-6 sm:p-10">
			{/* Animated Gradient Blobs (only rendered on sm and larger viewports to prevent mobile overflow scrolling) */}
			{showGradient && (
				<div className="hidden sm:block absolute inset-0 pointer-events-none">
					{/* Blob 1 */}
					<motion.div
						animate={{
							x: [0, 30, -15, 0],
							y: [0, -25, 25, 0],
							scale: [1, 1.1, 0.95, 1],
							opacity: [0.4, 0.6, 0.4],
						}}
						transition={{
							duration: 15,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						className="absolute top-10 left-10 w-80 h-40 rounded-full bg-accent-pink/50 blur-[90px]"
					/>

					{/* Blob 2 */}
					<motion.div
						animate={{
							x: [0, -25, 25, 0],
							y: [0, 30, -15, 0],
							scale: [1, 0.95, 1.05, 1],
							opacity: [0.35, 0.5, 0.35],
						}}
						transition={{
							duration: 18,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						className="absolute bottom-20 -right-20 w-96 h-50 rounded-full bg-accent-violet/50 blur-[100px]"
					/>

					{/* Blob 3 */}
					<motion.div
						animate={{
							x: [0, 15, -20, 0],
							y: [0, 15, -10, 0],
							scale: [0.95, 1.05, 0.95, 0.95],
							opacity: [0.3, 0.45, 0.3],
						}}
						transition={{
							duration: 12,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						className="absolute top-1/4 left-1/3 w-72 h-48 rounded-full bg-accent-lime/50 blur-[90px]"
					/>
				</div>
			)}

			{/* Content Layer */}
			<div className="relative z-10 flex flex-col items-center text-center">
				<h2 className="font-display text-3xl font-medium tracking-tight text-ink-deep md:text-4xl">
					{greeting || 'Where should we start?'}
				</h2>

				{/* Pill Input Container */}
				<div className="relative mt-8 w-full max-w-2xl">
					<div className="flex min-h-[52px] w-full items-center rounded-full border border-slate-200/80 bg-white px-5 py-2 shadow-sm transition-all duration-300 hover:shadow-md focus-within:border-accent-violet/30 focus-within:ring-2 focus-within:ring-accent-violet/20">
						{/* Input field */}
						<input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && submit(value)}
							placeholder="Ask AI Coach"
							className="flex-1 bg-transparent text-base text-ink-deep placeholder-slate-400 focus:outline-none"
						/>

						{/* Action Button: Send */}
						<AnimatePresence>
							{value.trim() && (
								<motion.button
									key="send"
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.8, opacity: 0 }}
									transition={{ duration: 0.15 }}
									type="button"
									onClick={() => submit(value)}
									className="ml-2 flex size-9 items-center justify-center rounded-full bg-accent-lime/75 text-slate-900 transition-colors hover:bg-accent-lime shadow-sm cursor-pointer"
									aria-label="Send"
								>
									<ArrowUp size={18} className="stroke-[2.5]" />
								</motion.button>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Suggestion Chips */}
				<div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
					{SUGGESTIONS.map((s) => (
						<button
							key={s}
							onClick={() => submit(s)}
							className="rounded-full border border-slate-200/50 bg-white/45 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-white/75 hover:shadow-md"
						>
							{s}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
