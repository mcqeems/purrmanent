'use client';

import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui';
import { GoogleIcon } from '@/components/ui/google-icon';

export function GoogleButton({
	label = 'Continue with Google',
}: {
	label?: string;
}) {
	return (
		<Button
			type="button"
			variant="inverted"
			className="w-full gap-2"
			onClick={() =>
				authClient.signIn.social({
					provider: 'google',
					callbackURL: `${window.location.origin}/dashboard`,
				})
			}
		>
			<GoogleIcon size={18} />
			{label}
		</Button>
	);
}
