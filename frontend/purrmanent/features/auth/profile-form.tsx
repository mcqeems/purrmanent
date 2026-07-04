'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authClient, useSession } from '@/lib/auth/client';
import { Button, Field, Input } from '@/components/ui';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Tell us your name'),
});
type ProfileFormInput = z.infer<typeof profileFormSchema>;

/** Editable profile fields (name). Email/verification live elsewhere — see
 * UnverifiedBanner — since better-auth treats email changes separately. */
export function ProfileForm() {
  const { data } = useSession();
  const user = data?.user;
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    values: { name: user?.name ?? '' },
  });

  async function onSubmit(values: ProfileFormInput) {
    setServerError(null);
    setSaved(false);
    const { error } = await authClient.updateUser({ name: values.name });
    if (error) {
      setServerError(error.message ?? 'Could not save your changes.');
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Name" htmlFor="profile-name" error={errors.name?.message}>
        <Input id="profile-name" {...register('name')} />
      </Field>
      <Field label="Email" htmlFor="profile-email">
        <Input id="profile-email" value={user?.email ?? ''} disabled />
      </Field>
      {serverError && <p className="text-sm text-accent-pink">{serverError}</p>}
      {saved && !isDirty && (
        <p className="text-sm text-accent-violet">Saved.</p>
      )}
      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
