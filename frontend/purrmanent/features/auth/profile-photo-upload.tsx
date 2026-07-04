'use client';

import { useState } from 'react';
import { authClient, useSession } from '@/lib/auth/client';
import { Avatar, AvatarFallback, AvatarImage, Spinner, useToast } from '@/components/ui';
import {
  supabase,
  SUPABASE_BUCKET,
  isUploadConfigured,
} from '@/lib/supabase/client';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/**
 * Profile picture — direct-to-Supabase upload (same pattern as
 * features/cats/photo-upload.tsx, uploaded under a profiles/ prefix), then
 * persisted via better-auth's updateUser (patches the users.image column).
 */
export function ProfilePhotoUpload() {
  const { data } = useSession();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const user = data?.user;

  async function handleFile(file: File) {
    if (!supabase) {
      toast({ tone: 'error', description: "Image upload isn't configured." });
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `profiles/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);

      const { error: updateError } = await authClient.updateUser({
        image: pub.publicUrl,
      });
      if (updateError) throw updateError;

      toast({ tone: 'success', description: 'Profile photo updated.' });
    } catch {
      toast({ tone: 'error', description: 'Upload failed. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        {user?.image && <AvatarImage src={user.image} alt={user.name} />}
        <AvatarFallback className="text-xl">
          {initials(user?.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <label
          className={`cursor-pointer rounded-md border border-hairline-cool px-3 py-2 text-sm font-medium text-ink-deep w-fit ${
            !isUploadConfigured || busy ? 'opacity-60' : ''
          }`}
        >
          {busy ? 'Uploading…' : 'Change photo'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy || !isUploadConfigured}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </label>
        {busy && <Spinner className="size-4 text-accent-violet" />}
        <p className="text-xs text-muted">JPG or PNG, up to a few MB.</p>
      </div>
    </div>
  );
}
