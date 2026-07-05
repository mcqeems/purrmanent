import { PageHeader } from '@/components/layout/app-shell';
import { CrisisFlow } from '@/features/crisis/crisis-flow';

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
