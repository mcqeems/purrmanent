import { apiFetch } from '@/lib/api/client';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function getVapidKey(): Promise<string> {
  const res = await apiFetch<{ publicKey?: string } | string>(
    '/push/vapid-public-key',
  );
  return typeof res === 'string' ? res : (res.publicKey ?? '');
}

export async function enablePush(): Promise<{ ok: boolean; message: string }> {
  if (
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return { ok: false, message: "Push isn't supported in this browser." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, message: 'Notifications permission was denied.' };
  }

  const key = await getVapidKey();
  if (!key)
    return { ok: false, message: 'Push is not configured on the server.' };

  const reg = await navigator.serviceWorker.register('/sw.js');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  });

  const json = sub.toJSON();
  await apiFetch('/push/subscribe', {
    method: 'POST',
    body: {
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent,
    },
  });
  return { ok: true, message: 'Reminders enabled!' };
}
