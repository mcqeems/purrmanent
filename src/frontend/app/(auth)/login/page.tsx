import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = {
	title: 'Login | Purrmanent',
	description: 'Sign in to your Purrmanent account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
