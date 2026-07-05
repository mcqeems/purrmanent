'use client';

import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useState } from 'react';
import { Spinner } from '@/components/ui';

export function GoogleButton({
	label = 'Continue with Google',
}: {
	label?: string;
}) {
	const [loading, setLoading] = useState(false);
	return (
		<Button
			type="button"
			variant="inverted"
			disabled={loading}
			className="w-full flex gap-2"
			onClick={() => {
				setLoading(true);
				authClient.signIn
					.social({
						provider: 'google',
						callbackURL: `${window.location.origin}/dashboard`,
					})
					.then(() => setLoading(false))
					.catch(() => setLoading(false));
			}}
		>
			<GoogleIcon size={18} />
			{label}
			{loading && <Spinner className="w-4 h-4" />}
		</Button>
	);
}
