'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth/client';
import { Button, Pill, Markdown, TypingDots } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useCopilot } from './copilot-provider';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

const ACTIONS = [
	'Add a cat named Mochi',
	'What should I do today?',
	'Show my @todo tasks',
	'Log a vaccination for my cat',
	'How often should I feed an adult cat?',
];

function InputPill({
	value,
	onChange,
	onSubmit,
	streaming,
}: {
	value: string;
	onChange: (s: string) => void;
	onSubmit: () => void;
	streaming: boolean;
}) {
	return (
		<div className="flex min-h-[52px] w-full items-center rounded-full border border-slate-200/80 bg-white px-5 py-2 shadow-sm transition-all duration-300 hover:shadow-md focus-within:border-accent-violet/30 focus-within:ring-2 focus-within:ring-accent-violet/20">
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
				placeholder="Ask AI Coach"
				className="flex-1 bg-transparent text-base text-ink-deep placeholder-slate-400 focus:outline-none"
				disabled={streaming}
			/>
			<AnimatePresence>
				{value.trim() && (
					<motion.button
						key="send"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.15 }}
						type="button"
						onClick={onSubmit}
						className="ml-2 flex size-9 items-center justify-center rounded-full bg-accent-lime/75 hover:bg-accent-lime text-slate-900 transition-colors hover:bg-[#7cb9e8] shadow-sm cursor-pointer"
						aria-label="Send"
						disabled={streaming}
					>
						<ArrowUp size={18} className="stroke-[2.5]" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}

export function CoachPage() {
	const { messages, streaming, send, confirm, conversationId } = useCopilot();
	const { data: session } = useSession();

	const [input, setInput] = useState('');
	const [greeting, setGreeting] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);

	const firstName = session?.user?.name
		? session.user.name.split(' ')[0]
		: 'Mustaqim';

	// Handle random greetings
	useEffect(() => {
		if (conversationId === null) {
			const GREETINGS = [
				'Where should we start?',
				'Any new cat?',
				`Hi ${firstName}, what's on your mind?`,
				'Got any questions?',
			];
			const rand = Math.floor(Math.random() * GREETINGS.length);
			setGreeting(GREETINGS[rand]);
		}
	}, [firstName, conversationId]);

	// Scroll to bottom on new messages
	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: 'smooth',
		});
	}, [messages]);

	function submit() {
		const trimmed = input.trim();
		if (!trimmed) return;
		void send(trimmed);
		setInput('');
	}

	const hasMessages = messages.length > 0;

	return (
		<div className="relative flex flex-col flex-1 h-full w-full bg-transparent">
			{/* Main Layout Container */}
			<div className="relative z-10 flex flex-col flex-1 h-full select-none">
				{/* Messages Pane */}
				<div
					className={cn(
						'flex flex-col w-full transition-all duration-500 ease-in-out',
						hasMessages
							? 'flex-1 overflow-y-auto p-4 space-y-3'
							: 'h-0 overflow-hidden',
					)}
					ref={scrollRef}
				>
					{hasMessages &&
						messages.map((m) => {
							if (
								m.role === 'assistant' &&
								!m.content &&
								!m.pending &&
								!(m.sources && m.sources.length)
							) {
								return null;
							}
							return (
								<div
									key={m.id}
									className={cn(
										'max-w-[85%] rounded-md px-3 py-2 text-sm',
										m.role === 'user'
											? 'ml-auto bg-accent-lime text-surface-canvas-dark'
											: 'bg-transparent text-ink-deep',
									)}
								>
									{m.role === 'assistant' ? (
										<Markdown content={m.content} />
									) : (
										<span className="whitespace-pre-wrap break-words">
											{m.content}
										</span>
									)}
									{m.sources && m.sources.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-1">
											{m.sources.map((s, idx) => (
												<Pill key={idx} tone="lime">
													{s.source ?? 'source'}
												</Pill>
											))}
										</div>
									)}
									{m.pending && (
										<div className="mt-2 rounded-md border border-accent-violet/40 p-2">
											<p className="mb-2 text-xs text-muted">
												Confirm action: <strong>{m.pending.actionName}</strong>
											</p>
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => confirm(m.id, m.pending!, true)}
												>
													Confirm
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => confirm(m.id, m.pending!, false)}
												>
													Cancel
												</Button>
											</div>
										</div>
									)}
								</div>
							);
						})}
					{streaming && (
						<div className="flex items-center gap-2 px-1">
							<TypingDots className="text-accent-violet" />
							<span className="text-xs text-muted">Coach is thinking…</span>
						</div>
					)}
				</div>

				{/* Input & Home Welcome Section */}
				<div
					className={cn(
						'flex flex-col items-center transition-all duration-500 ease-in-out',
						hasMessages
							? 'pt-2 pb-3 px-4 border-t border-slate-100 bg-white'
							: 'flex-1 justify-center py-10',
					)}
				>
					{!hasMessages && (
						<motion.h2
							initial={{ opacity: 0, y: -15 }}
							animate={{ opacity: 1, y: 0 }}
							className="font-display text-3xl font-medium tracking-tight text-ink-deep md:text-4xl mb-8 text-center"
						>
							{greeting}
						</motion.h2>
					)}

					<div className="w-full max-w-2xl px-4">
						<InputPill
							value={input}
							onChange={setInput}
							onSubmit={submit}
							streaming={streaming}
						/>
					</div>

					{!hasMessages && (
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl px-4"
						>
							{ACTIONS.map((a) => (
								<button
									key={a}
									onClick={() => void send(a)}
									className="rounded-full border border-slate-200/50 bg-white/45 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-white/75 hover:shadow-md cursor-pointer"
								>
									{a}
								</button>
							))}
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}
