'use client';

import { useState } from 'react';
import { Spinner, toast } from '@/components/ui';
import {
  supabase,
  SUPABASE_BUCKET,
  isUploadConfigured,
} from '@/lib/supabase/client';

export function PhotoUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!supabase) {
      toast.error("Image upload isn't configured.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `cats/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success('Photo uploaded.');
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Cat"
          className="size-14 rounded-md object-cover"
        />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-md bg-surface-press-light text-xs text-muted">
          No photo
        </div>
      )}
      <label
        className={`cursor-pointer rounded-md border border-hairline-cool px-3 py-2 text-sm ${
          !isUploadConfigured || busy ? 'opacity-60' : ''
        }`}
      >
        {busy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
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
    </div>
  );
}
