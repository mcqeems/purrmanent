'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO, isValid } from 'date-fns';
import { MessageSquare, HelpCircle, Plus } from 'lucide-react';
import { useCopilot } from './copilot-provider';
import { useConversations } from './history-hooks';
import { Markdown } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

const MANUAL_MARKDOWN = `# AI Coach User Manual

Welcome to your **Purrmanent AI Coach**! This guide outlines the capabilities and usage instructions for your behavioral and health assistant.

---

## 🚀 Key Capabilities

### 1. Cat Management & Care
Ask anything about cat health, diet, behavioral modification, or breed characteristics:
* *"How often should I feed an adult cat?"*
* *"What is the best way to introduce two cats?"*
* *"Log a vaccination for my cat Mochi"*

### 2. Daily Checklist Control
You can manage your daily chores and progress directly through chat prompts:
* *"Add a new cat named Milo"*
* *"What should I do today?"*
* *"Check off my daily tasks"*

### 3. Contextual Mentions
You can mention specific categories or cats in your query using the \`@\` symbol to give the coach precise context:
* **Checklist columns:** Use \`@todo\`, \`@progress\`, or \`@done\`.
  * *Example:* *"Show my \`@todo\` tasks"* or *"What's the status of my \`@progress\` board?"*
* **Specific Cats:** Mention a cat's name to fetch its logs, weight records, or medication history.

---

## 🔒 Confirmed Actions
For safety, any database changes (e.g., adding cats, checking items) require your **explicit confirmation**.
* The coach will prepare the database write action and show you a preview card.
* Click **Confirm** to execute, or **Cancel** to abort.

---

## 💬 Conversation History
Your chats are saved automatically. You can always select and resume previous sessions using the floating **Sessions Bubble** on the left side of the page.
`;

function ts(d: string) {
	const date = parseISO(d);
	return isValid(date) ? format(date, 'MMM d, HH:mm') : '';
}

function SessionsPanel({
	conversations,
	currentId,
	onSelect,
	onNewChat,
	isNewChatDisabled,
}: {
	conversations: any[];
	currentId: number | null;
	onSelect: (id: number) => void;
	onNewChat: () => void;
	isNewChatDisabled: boolean;
}) {
	return (
		<div className="flex max-h-[60vh] md:max-h-[70vh] w-full flex-col overflow-hidden bg-white text-ink-deep rounded-xl">
			<header className="border-b border-slate-100 px-4 py-3.5 bg-slate-50 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 shadow-inner">
					<MessageSquare size={18} className="stroke-[2.5]" />
				</div>
				<div className="flex flex-col">
					<span className="font-semibold text-sm text-ink-deep leading-none mb-1">
						Sessions
					</span>
					<span className="text-[11px] text-slate-400">History</span>
				</div>
			</header>

			{/* New Conversation Section */}
			<div className="border-b border-slate-100 p-3 bg-slate-50/50">
				<button
					onClick={onNewChat}
					disabled={isNewChatDisabled}
					className={cn(
						'flex w-full items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold shadow-sm transition-all duration-200',
						isNewChatDisabled
							? 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
							: 'bg-accent-violet text-white hover:bg-accent-violet-deep border border-accent-violet hover:shadow cursor-pointer',
					)}
				>
					<Plus size={14} className="stroke-[2.5]" />
					<span>New Chat</span>
				</button>
			</div>

			{/* Sessions list container with max height to fit 5 items (approx 180px) and scrollable */}
			<div className="overflow-y-auto p-3 space-y-1 bg-white max-h-[180px] scrollbar-thin">
				{conversations.length === 0 ? (
					<p className="text-xs text-slate-400 p-2">No past sessions found.</p>
				) : (
					conversations.map((c) => (
						<button
							key={c.id}
							onClick={() => onSelect(c.id)}
							className={cn(
								'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors',
								currentId === c.id
									? 'bg-slate-100 text-ink-deep font-semibold'
									: 'text-slate-500 hover:bg-slate-50 hover:text-ink-deep',
							)}
						>
							<MessageSquare size={12} />
							<span className="truncate">
								{c.lastMessageAt ? ts(c.lastMessageAt) : ts(c.startedAt)}
							</span>
						</button>
					))
				)}
			</div>
		</div>
	);
}

function ManualPanel() {
	return (
		<div className="flex max-h-[60vh] md:max-h-[70vh] w-full flex-col overflow-hidden bg-white text-ink-deep rounded-xl">
			<header className="border-b border-slate-100 px-4 py-3.5 bg-slate-50 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 shadow-inner">
					<HelpCircle size={18} className="stroke-[2.5]" />
				</div>
				<div className="flex flex-col">
					<span className="font-semibold text-sm text-ink-deep leading-none mb-1">
						Docs
					</span>
					<span className="text-[11px] text-slate-400 font-sans tracking-wide">
						the Manual Guide
					</span>
				</div>
			</header>
			<div className="flex-1 overflow-y-auto p-6 text-xs prose prose-slate max-w-none bg-white max-h-[420px] scrollbar-thin">
				<Markdown content={MANUAL_MARKDOWN} />
			</div>
		</div>
	);
}

export function CoachBubbles() {
	const { conversationId, loadConversation, newChat, messages } = useCopilot();
	const { data: conversations } = useConversations();
	const managerRef = useRef<any>(null);

	const [sessionsIconContainer] = useState(() => {
		if (typeof window === 'undefined') return null;
		const el = document.createElement('div');
		el.className = 'flex h-full w-full items-center justify-center text-white';
		return el;
	});

	const [sessionsContainer] = useState(() => {
		if (typeof window === 'undefined') return null;
		const el = document.createElement('div');
		el.className = 'h-full';
		return el;
	});

	const [manualIconContainer] = useState(() => {
		if (typeof window === 'undefined') return null;
		const el = document.createElement('div');
		el.className = 'flex h-full w-full items-center justify-center text-white';
		return el;
	});

	const [manualContainer] = useState(() => {
		if (typeof window === 'undefined') return null;
		const el = document.createElement('div');
		el.className = 'h-full';
		return el;
	});

	useEffect(() => {
		if (
			!sessionsContainer ||
			!sessionsIconContainer ||
			!manualContainer ||
			!manualIconContainer
		)
			return;

		import('@hyperplexed/bubbles').then(({ createBubbles }) => {
			if (managerRef.current) return;

			const getWidths = () => {
				const isMobile = window.innerWidth < 640;
				return {
					manual: (isMobile ? '92%' : 680) as any,
					sessions: (isMobile ? '92%' : 320) as any,
				};
			};

			const { manual: initialManualWidth, sessions: initialSessionsWidth } =
				getWidths();

			const manager = createBubbles({
				theme: 'light',
				colors: {
					bubbleSurface: '#c2ef4e', // Accent Violet
					focusRing: '#6a5fc1', // Electric Lime
					panelSurface: '#ffffff', // White panel
					panelText: '#1f1633', // Ink Violet text
					dismissSurface: '#e5484d',
					dismissIcon: '#ffffff',
				},
				panelWidth: initialSessionsWidth,
				panelMaxHeight: '75%',
				side: 'right',
			});

			managerRef.current = manager;

			manager.add({
				id: 'manual',
				label: 'User Manual',
				panelWidth: initialManualWidth,
				icon: manualIconContainer,
				content: manualContainer,
			});

			manager.add({
				id: 'sessions',
				label: 'Sessions History',
				panelWidth: initialSessionsWidth,
				icon: sessionsIconContainer,
				content: sessionsContainer,
			});

			const handleResize = () => {
				const { manual, sessions } = getWidths();
				manager.add({
					id: 'manual',
					label: 'User Manual',
					panelWidth: manual,
					icon: manualIconContainer,
					content: manualContainer,
				});
				manager.add({
					id: 'sessions',
					label: 'Sessions History',
					panelWidth: sessions,
					icon: sessionsIconContainer,
					content: sessionsContainer,
				});
			};

			window.addEventListener('resize', handleResize);
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		});

		return () => {
			managerRef.current?.destroy();
			managerRef.current = null;
		};
	}, [
		sessionsContainer,
		sessionsIconContainer,
		manualContainer,
		manualIconContainer,
	]);

	function handleSelectSession(id: number) {
		void loadConversation(id);
		managerRef.current?.toggle();
	}

	function handleNewChat() {
		newChat();
		managerRef.current?.toggle();
	}

	const isNewChatDisabled = conversationId === null && messages.length === 0;

	if (
		!sessionsIconContainer ||
		!sessionsContainer ||
		!manualIconContainer ||
		!manualContainer
	) {
		return null;
	}

	return (
		<>
			{createPortal(
				<MessageSquare
					size={20}
					className="stroke-[2.5] text-surface-canvas-dark"
				/>,
				sessionsIconContainer,
			)}
			{createPortal(
				<SessionsPanel
					conversations={conversations || []}
					currentId={conversationId}
					onSelect={handleSelectSession}
					onNewChat={handleNewChat}
					isNewChatDisabled={isNewChatDisabled}
				/>,
				sessionsContainer,
			)}

			{createPortal(
				<HelpCircle
					size={20}
					className="stroke-[2.5] text-surface-canvas-dark"
				/>,
				manualIconContainer,
			)}
			{createPortal(<ManualPanel />, manualContainer)}
		</>
	);
}
