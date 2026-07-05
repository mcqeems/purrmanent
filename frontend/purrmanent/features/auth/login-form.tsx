'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { authClient } from '@/lib/auth/client';
import { Button, Field, Input } from '@/components/ui';
import { GoogleButton } from './google-button';

export function LoginForm() {
	const [serverError, setServerError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	});

	async function onSubmit(values: LoginInput) {
		setServerError(null);
		const { error } = await authClient.signIn.email({
			email: values.email,
			password: values.password,
			rememberMe: values.rememberMe ?? true,
		});
		if (error) {
			setServerError(error.message ?? 'Login failed. Check your details.');
			return;
		}
		window.location.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Welcome back</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<Field label="Email" htmlFor="email" error={errors.email?.message}>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						aria-invalid={!!errors.email}
						{...register('email')}
					/>
				</Field>
				<Field
					label="Password"
					htmlFor="password"
					error={errors.password?.message}
				>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						aria-invalid={!!errors.password}
						{...register('password')}
					/>
				</Field>
				{serverError && (
					<p className="text-sm text-accent-pink">{serverError}</p>
				)}
				<Button
					type="submit"
					variant="emboss"
					size="lg"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Signing in…' : 'Sign in'}
				</Button>
			</form>
			<div className="flex items-center gap-3">
				<div className="flex-1 h-px bg-hairline-cloud" />
				<span className="text-xs text-on-dark-muted">or</span>
				<div className="flex-1 h-px bg-hairline-cloud" />
			</div>
			<GoogleButton />
			<p className="text-center text-sm text-on-dark-muted">
				No account?{' '}
				<Link href="/register" className="text-accent-lime underline">
					Create one
				</Link>
			</p>
		</div>
	);
}
