import type { Metadata } from 'next';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';

export const metadata: Metadata = {
	title: 'Dashboard | Purrmanent',
	description: "Your cats and today's progress at a glance.",
};

export default function DashboardPage() {
	return <DashboardShell />;
}
