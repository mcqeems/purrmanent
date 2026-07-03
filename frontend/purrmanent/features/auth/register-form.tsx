'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { registerSchema } from '@/lib/validation/schemas';
import { authClient } from '@/lib/auth/client';
import { Button, Field, Input } from '@/components/ui';
import { GoogleButton } from './google-button';

// better-auth email sign-up requires a name; make it required at the form level.
const registerFormSchema = registerSchema.extend({
  name: z.string().min(1, 'Tell us your name'),
});
type RegisterFormInput = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({ resolver: zodResolver(registerFormSchema), mode: 'onChange' });

  async function onSubmit(values: RegisterFormInput) {
    setServerError(null);
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: `${window.location.origin}/onboarding`,
    });
    if (error) {
      setServerError(error.message ?? 'Could not create your account.');
      return;
    }
    router.push('/onboarding');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
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
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
          {isSubmitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-hairline-cloud" />
        <span className="text-xs text-on-dark-muted">or</span>
        <div className="flex-1 h-px bg-hairline-cloud" />
      </div>
      <GoogleButton label="Sign up with Google" />
      <p className="text-center text-sm text-on-dark-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent-lime underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
