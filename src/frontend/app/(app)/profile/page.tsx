'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cat, MessageSquare, Trophy, SquarePen, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/app-shell';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Card,
	Separator,
} from '@/components/ui';
import { useSession } from '@/lib/auth/client';
import { useCats } from '@/features/cats/hooks';
import { useConversations } from '@/features/coach/history-hooks';
import { useGamificationStatus } from '@/features/gamification/hooks';
import { ProfilePhotoUpload } from '@/features/auth/profile-photo-upload';
import { ProfileForm } from '@/features/auth/profile-form';

function initials(name?: string | null) {
	if (!name) return '?';
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]!.toUpperCase())
		.join('');
}

function StatCard({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: typeof Cat;
	label: string;
	value: string | number;
	href: string;
}) {
	return (
		<Link href={href}>
			<Card className="flex items-center gap-3 p-4 hover:border-accent-violet/40 transition-colors">
				<span className="flex size-10 items-center justify-center rounded-lg bg-accent-violet-deep/10 text-accent-violet">
					<Icon size={20} />
				</span>
				<div>
					<p className="text-xs text-muted">{label}</p>
					<p className="text-xl font-semibold">{value}</p>
				</div>
			</Card>
		</Link>
	);
}

export default function ProfilePage() {
	const [editing, setEditing] = useState(false);
	const { data } = useSession();
	const user = data?.user;
	const { data: cats = [] } = useCats();
	const { data: convs = [] } = useConversations();
	const { data: status } = useGamificationStatus();

	if (editing) {
		return (
			<>
				<PageHeader
					title="Edit Profile"
					subtitle="Update your name and photo."
					action={
						<Button
							variant="outline"
							size="sm"
							onClick={() => setEditing(false)}
						>
							<ArrowLeft size={16} /> Back
						</Button>
					}
				/>
				<Card className="w-full space-y-6">
					<ProfilePhotoUpload />
					<ProfileForm onCancel={() => setEditing(false)} />
				</Card>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Profile"
				subtitle="Your account details and stats."
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditing(true)}
					>
						<SquarePen size={16} /> Edit Profile
					</Button>
				}
			/>
			<Card className="w-full space-y-6">
				<div className="flex items-center gap-4">
					<Avatar className="size-20">
						{user?.image && (
							<AvatarImage src={user.image} alt={user.name} />
						)}
						<AvatarFallback className="text-xl">
							{initials(user?.name)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h2 className="text-lg font-semibold">{user?.name ?? 'User'}</h2>
						<p className="text-sm text-muted">{user?.email ?? ''}</p>
					</div>
				</div>
				<Separator />
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<StatCard
						icon={Cat}
						label="Cats"
						value={cats.length}
						href="/cats"
					/>
					<StatCard
						icon={MessageSquare}
						label="Conversations"
						value={convs.length}
						href="/coach"
					/>
					<StatCard
						icon={Trophy}
						label="Points"
						value={status?.points ?? 0}
						href="/progress"
					/>
				</div>
			</Card>
		</>
	);
}
