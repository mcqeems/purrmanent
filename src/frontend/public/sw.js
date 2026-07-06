// Minimal service worker for Web Push (FRONTEND_BUILD_PLAN.md §8).
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'Purrmanent';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: { url: payload.url || '/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(self.clients.openWindow(url));
});
