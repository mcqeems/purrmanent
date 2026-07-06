import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
	title: 'Register | Purrmanent',
	description: 'Create your Purrmanent account and start your cat\'s 90-day journey.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
