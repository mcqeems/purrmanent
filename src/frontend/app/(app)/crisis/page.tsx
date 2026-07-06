import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/app-shell';
import { CrisisFlow } from '@/features/crisis/crisis-flow';

export const metadata: Metadata = {
	title: 'Crisis Mode | Purrmanent',
	description: 'Describe what\'s wrong and get an immediate, guided protocol.',
};

export default function CrisisPage() {
	return (
		<>
			<PageHeader
				title="Crisis Mode"
				subtitle="Describe what's wrong and get an immediate, guided protocol."
			/>
			<CrisisFlow />
		</>
	);
}
