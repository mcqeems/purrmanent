'use client';

import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	Sector,
	PieSectorShapeProps,
} from 'recharts';
import { Cat, ListTodo, Trophy, Flame, ChartPie } from 'lucide-react';
import { Card } from '@/components/ui';
import { useGlobalBoard } from '@/features/checklist/hooks';
import { useGamificationStatus } from '@/features/gamification/hooks';

const COLORS = {
	todo: '#cfcfdb',
	progress: '#6a5fc1',
	done: '#c2ef4e',
};

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Cat;
	label: string;
	value: string | number;
}) {
	return (
		<Card className="flex items-center gap-3 p-4">
			<span className="flex size-10 items-center justify-center rounded-lg bg-accent-violet-deep/10 text-accent-violet">
				<Icon size={20} />
			</span>
			<div>
				<p className="text-xs text-muted">{label}</p>
				<p className="text-xl font-semibold">{value}</p>
			</div>
		</Card>
	);
}

interface Donut {
	name: string;
	value: number;
	key: 'todo' | 'progress' | 'done';
}

interface CustomPieSectorProps extends PieSectorShapeProps {
	payload?: Donut;
}

const CustomPieSector = (props: CustomPieSectorProps) => {
	const { payload, ...rest } = props;

	const fillColor = payload?.key ? COLORS[payload.key] : '#cccccc';

	return <Sector {...rest} fill={fillColor} />;
};

export function DashboardStats() {
	const { data: boards = [] } = useGlobalBoard();
	const { data: status } = useGamificationStatus();

	if (boards.length === 0) return null;

	const totals = boards.reduce(
		(acc, b) => ({
			todo: acc.todo + b.todo,
			progress: acc.progress + b.progress,
			done: acc.done + b.done,
		}),
		{ todo: 0, progress: 0, done: 0 },
	);
	const grand = totals.todo + totals.progress + totals.done;
	const completion = grand > 0 ? Math.round((totals.done / grand) * 100) : 0;

	const donut: Donut[] = [
		{ name: 'To-Do', value: totals.todo, key: 'todo' as const },
		{ name: 'In Progress', value: totals.progress, key: 'progress' as const },
		{ name: 'Done', value: totals.done, key: 'done' as const },
	].filter((d) => d.value > 0);

	const perCat = boards.map((b) => {
		const t = b.todo + b.progress + b.done;
		return { name: b.name, pct: t > 0 ? Math.round((b.done / t) * 100) : 0 };
	});

	return (
		<div data-tour="stats" className="mb-8 space-y-4">
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
				<StatCard icon={Trophy} label="Points" value={status?.points ?? 0} />
				<StatCard icon={Flame} label="Day streak" value={status?.streak ?? 0} />
				<StatCard icon={Cat} label="Cats" value={boards.length} />
				<StatCard icon={ChartPie} label="Completion" value={`${completion}%`} />
				<StatCard icon={ListTodo} label="Tasks done" value={totals.done} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<h3 className="mb-2 text-sm font-semibold">Task breakdown</h3>
					<ResponsiveContainer width="100%" height={200}>
						<PieChart>
							<Pie
								data={donut}
								dataKey="value"
								nameKey="name"
								innerRadius={50}
								outerRadius={80}
								paddingAngle={2}
								shape={CustomPieSector}
							/>
							<Tooltip
								contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
								itemStyle={{ color: '#150f23' }}
								labelStyle={{ color: '#150f23' }}
							/>
						</PieChart>
					</ResponsiveContainer>
					<div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-ink-deep">
						{donut.map((d) => (
							<span key={d.key} className="flex items-center gap-1.5">
								<span
									className="size-3 rounded-full"
									style={{ backgroundColor: COLORS[d.key] }}
								/>
								{d.name} ({d.value})
							</span>
						))}
					</div>
				</Card>

				<Card>
					<h3 className="mb-2 text-sm font-semibold">Completion by cat</h3>
					<ResponsiveContainer width="100%" height={200}>
						<BarChart data={perCat}>
							<XAxis dataKey="name" tick={{ fontSize: 12 }} />
							<Tooltip
								formatter={(value) => `${String(value)}%`}
								contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
								itemStyle={{ color: '#150f23' }}
								labelStyle={{ color: '#150f23' }}
								cursor={{ fill: 'rgba(106,95,193,0.08)' }}
							/>
							<Bar dataKey="pct" radius={[6, 6, 0, 0]} fill={COLORS.progress} />
						</BarChart>
					</ResponsiveContainer>
				</Card>
			</div>
		</div>
	);
}
