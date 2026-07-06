import type { Metadata } from 'next';
import { CoachShell } from '@/features/coach/coach-shell';

export const metadata: Metadata = {
	title: 'AI Coach | Purrmanent',
	description: 'Chat with your AI cat care coach, take actions, and revisit past conversations.',
};

export default function AICoachPage() {
	return <CoachShell />;
}
