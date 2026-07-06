'use client';

import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
	MessageSquare,
	HeartPulse,
	ClipboardCheck,
	AlertTriangle,
	WifiIcon,
	BatteryMediumIcon,
	SendHorizontalIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import phoneFrame from '@/app/assets/home/phone-frame.png';

function CoachFeatureCard({
	icon: Icon,
	label,
	title,
	desc,
}: {
	icon: LucideIcon;
	label: string;
	title: string;
	desc: string;
}) {
	return (
		<div className="bg-surface-night rounded-[28px] p-8 border border-hairline-violet/20 flex flex-col items-start group hover:-translate-y-1 hover:border-accent-lime/40 transition-all duration-300">
			<div className="size-12 rounded-2xl bg-accent-violet/10 flex items-center justify-center mb-6 border border-accent-violet/20">
				<Icon className="w-5 h-5 text-accent-violet group-hover:text-accent-lime transition-colors" />
			</div>
			<span className="text-[13px] font-semibold text-accent-violet group-hover:text-accent-lime transition-colors mb-2 font-sans tracking-wide uppercase">
				{label}
			</span>
			<h3 className="font-display text-2xl font-bold text-on-primary leading-tight mb-3">
				{title}
			</h3>
			<p className="text-[14px] text-on-dark-muted leading-relaxed font-sans">
				{desc}
			</p>
		</div>
	);
}

function ChatBubble({
	sender,
	children,
}: {
	sender: 'you' | 'coach';
	children: React.ReactNode;
}) {
	const isUser = sender === 'you';
	return (
		<motion.div
			initial={{ opacity: 0, y: 12, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 400, damping: 30 }}
			className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} gap-1 max-w-[85%] ${isUser ? '' : 'ml-auto'}`}
		>
			<span className="text-[8px] text-muted font-medium ml-1">
				{isUser ? 'You' : 'Coach'}
			</span>
			<div
				className={`${isUser ? 'bg-surface-press-light text-ink-deep rounded-tl-sm' : 'bg-accent-violet text-on-primary rounded-tr-sm'} rounded-[18px] px-3.5 py-2 text-[11px] leading-normal`}
			>
				{children}
			</div>
		</motion.div>
	);
}

const CONVERSATION = [
	{
		user: 'What should Milo work on today?',
		coach: (
			<>
				Based on Day 12, I recommend:
				<br />
				1. Scent swap session
				<br />
				2. Wet food near door
				<br />
				3. 10min quiet presence
				<br />
				<br />
				Add these to today&apos;s checklist?
			</>
		),
	},
	{
		user: 'Yes, add them all',
		coach: "✓ 3 tasks added to today's board. Good luck with Milo!",
	},
];

const TYPING_SPEED = 50;

function TypingIndicator() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 400, damping: 30 }}
			className="flex flex-col items-end gap-1 max-w-[85%] ml-auto"
		>
			<span className="text-[8px] text-muted font-medium mr-1">Coach</span>
			<div className="bg-accent-violet text-on-primary rounded-[18px] rounded-tr-sm px-3.5 py-2.5 text-[11px] flex gap-1.5 items-center shadow-sm">
				<span
					className="size-1 bg-on-primary/60 rounded-full animate-bounce"
					style={{ animationDelay: '0ms' }}
				/>
				<span
					className="size-1 bg-on-primary/60 rounded-full animate-bounce"
					style={{ animationDelay: '150ms' }}
				/>
				<span
					className="size-1 bg-on-primary/60 rounded-full animate-bounce"
					style={{ animationDelay: '300ms' }}
				/>
			</div>
		</motion.div>
	);
}

let hasAnimatedGlobal = false;

function PhoneMockup() {
	const [chatHistory, setChatHistory] = useState<
		{ sender: 'you' | 'coach'; text: React.ReactNode }[]
	>([]);
	const [inputText, setInputText] = useState('');
	const [coachIsTyping, setCoachIsTyping] = useState(false);
	const [isTypingPhase, setIsTypingPhase] = useState(true);
	const scrollRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const startedRef = useRef(false);

	// Start animation only when the phone is on screen
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		function startAnimation() {
			if (startedRef.current) return;
			startedRef.current = true;

			if (hasAnimatedGlobal) {
				const initialHistory: {
					sender: 'you' | 'coach';
					text: React.ReactNode;
				}[] = [];
				CONVERSATION.forEach((pair) => {
					initialHistory.push({ sender: 'you', text: pair.user });
					initialHistory.push({ sender: 'coach', text: pair.coach });
				});
				setChatHistory(initialHistory);
				setIsTypingPhase(false);
				setInputText('');
				setCoachIsTyping(false);
				return;
			}

			let active = true;

			const runSequence = async () => {
				if (!active) return;

				setChatHistory([]);
				setInputText('');
				setCoachIsTyping(false);
				setIsTypingPhase(true);
				await new Promise((resolve) => setTimeout(resolve, 1500));
				if (!active) return;

				for (let i = 0; i < CONVERSATION.length; i++) {
					if (!active) break;
					const pair = CONVERSATION[i];

					setIsTypingPhase(true);
					const userText = pair.user;
					for (let charIndex = 0; charIndex <= userText.length; charIndex++) {
						if (!active) break;
						setInputText(userText.slice(0, charIndex));
						await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
					}
					if (!active) break;

					await new Promise((resolve) => setTimeout(resolve, 600));
					if (!active) break;

					setInputText('');
					setIsTypingPhase(false);
					setChatHistory((prev) => [...prev, { sender: 'you', text: userText }]);

					await new Promise((resolve) => setTimeout(resolve, 800));
					if (!active) break;

					setCoachIsTyping(true);
					await new Promise((resolve) => setTimeout(resolve, 1500));
					if (!active) break;

					setCoachIsTyping(false);
					setChatHistory((prev) => [
						...prev,
						{ sender: 'coach', text: pair.coach },
					]);

					if (i < CONVERSATION.length - 1) {
						await new Promise((resolve) => setTimeout(resolve, 2000));
					}
				}

				if (active) {
					hasAnimatedGlobal = true;
				}
			};

			runSequence();

			// ponytail: cleanup stored in ref so observer callback can't double-start
			cleanupRef.current = () => { active = false; };
		}

		const cleanupRef = { current: () => {} };

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
					startAnimation();
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(el);

		return () => {
			observer.disconnect();
			cleanupRef.current();
		};
	}, []);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}
	}, [chatHistory, coachIsTyping]);

	return (
		<div ref={containerRef} className="relative w-[300px] h-[610px] flex-shrink-0 scale-100">
			<Image
				src={phoneFrame}
				alt="Phone frame"
				fill
				className="object-contain z-10 pointer-events-none"
			/>

			<div className="absolute inset-0 flex flex-col overflow-hidden select-none pt-[22px] pb-[18px] px-[14px] z-20">
				<div className="h-7 px-6 flex justify-between items-center text-[11px] font-semibold text-muted">
					<span>9:41</span>
					<div className="flex items-center gap-1.5">
						<WifiIcon className="w-3.5 h-3.5 fill-muted" />
						<BatteryMediumIcon className="w-3.5 h-3.5 fill-muted" />
					</div>
				</div>

				<div className="flex-1 flex flex-col justify-between pt-1 pb-6 px-4">
					<div className="flex items-center justify-between pb-3 border-b border-hairline-cloud">
						<div className="flex items-center gap-1.5">
							<div className="size-2 bg-accent-lime rounded-full animate-pulse" />
							<span className="text-[10px] font-bold text-muted uppercase tracking-wider">
								Purrmanent AI Coach
							</span>
						</div>
					</div>

					<div
						ref={scrollRef}
						className="flex-1 flex flex-col gap-3 my-4 overflow-y-auto pr-1"
					>
						{chatHistory.map((msg, i) => (
							<ChatBubble key={i} sender={msg.sender}>
								{msg.text}
							</ChatBubble>
						))}
						{coachIsTyping && <TypingIndicator />}
					</div>

					<div className="bg-white border border-hairline-cloud rounded-full py-2 px-3.5 flex items-center justify-between">
						<div className="flex items-center gap-2 text-muted flex-1 min-w-0">
							<MessageSquare size={12} className="shrink-0" />
							{isTypingPhase && inputText ? (
								<span className="text-[11px] text-ink-deep truncate">
									{inputText}
									<span className="inline-block w-[1.5px] h-3 bg-slate-800 animate-pulse ml-0.5 align-middle" />
								</span>
							) : (
								<span className="text-[11px] text-slate-400 truncate">
									Ask about Milo&apos;s progress...
								</span>
							)}
						</div>
						<div className="size-5 bg-accent-violet rounded-full flex items-center justify-center text-on-primary shrink-0">
							<SendHorizontalIcon className="w-3 h-3" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const LEFT_CARDS = [
	{
		icon: MessageSquare,
		label: 'Conversational AI',
		title: 'Ask anything',
		desc: 'Ask about behavior, feeding, health, or transitions.',
	},
	{
		icon: HeartPulse,
		label: 'Health Tracking',
		title: 'Health log',
		desc: 'Log vaccinations, weight, and vet visits.',
	},
] as const;

const RIGHT_CARDS = [
	{
		icon: ClipboardCheck,
		label: 'Daily Management',
		title: 'Checklists',
		desc: 'Manage your daily and phase checklists.',
	},
	{
		icon: AlertTriangle,
		label: 'Crisis Support',
		title: 'When something\'s wrong',
		desc: 'Get step-by-step guidance when your cat needs help.',
	},
] as const;

export function AiCoachSection() {
	return (
		<section
			id="ai-coach"
			className="bg-surface-canvas-dark py-24 relative overflow-hidden"
		>
			<div className="absolute inset-0" />

			<div className="mx-auto max-w-6xl px-6 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className="text-center mb-16"
				>
					<span className="text-xs font-bold uppercase tracking-[2px] text-accent-lime bg-accent-lime/10 px-3 py-1 rounded-full inline-block">
						AI Coach
					</span>
					<h2 className="font-display text-4xl md:text-5xl font-bold text-on-primary tracking-tight mt-4">
						AI Coach
					</h2>
					<p className="text-on-dark-muted mt-3 max-w-xl mx-auto text-sm leading-relaxed">
						Ask questions. Get answers from a cat care knowledge base.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
					<div className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
						{LEFT_CARDS.map((card, idx) => (
							<motion.div
								key={card.title}
								initial={{ x: 80, opacity: 0, scale: 0.85 }}
								whileInView={{ x: 0, opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{
									type: 'spring',
									stiffness: 200,
									damping: 18,
									mass: 0.8,
									delay: 0.3 + idx * 0.2,
								}}
							>
								<CoachFeatureCard {...card} />
							</motion.div>
						))}
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
						className="lg:col-span-4 flex justify-center order-1 lg:order-2 py-4 relative"
					>
						<PhoneMockup />
						<div className="absolute bottom-4 left-0 right-0 h-48 bg-gradient-to-t from-surface-canvas-dark via-surface-canvas-dark/50 to-transparent pointer-events-none z-20 md:block hidden" />
					</motion.div>

					<div className="lg:col-span-4 flex flex-col gap-8 order-3 lg:order-3">
						{RIGHT_CARDS.map((card, idx) => (
							<motion.div
								key={card.title}
								initial={{ x: -80, opacity: 0, scale: 0.85 }}
								whileInView={{ x: 0, opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{
									type: 'spring',
									stiffness: 200,
									damping: 18,
									mass: 0.8,
									delay: 0.4 + idx * 0.2,
								}}
							>
								<CoachFeatureCard {...card} />
							</motion.div>
						))}
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className="max-w-4xl mx-auto px-6 mt-16"
				>
					<div className="flex text-center items-center justify-center gap-3 text-[13px] text-on-dark-muted leading-relaxed">
						<p>
							<span className="font-semibold text-on-primary">Note: </span> AI
							Coach is designed to help guide your cat&apos;s adaptation, but
							does not replace professional veterinary diagnosis or advice.
						</p>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
