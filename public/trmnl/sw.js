// TRMNL phone app: keep the app shell so it opens instantly; everything live always comes from the network.
const SHELL = 'trmnl-shell-v2';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['./', './index.html', './icon-180.png']))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== SHELL).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // the gateway + storage: always live
  if (u.pathname.includes('/api/') || (e.request.headers.get('accept') || '').includes('text/event-stream')) return;   // live streams (e.g. TRMNL's preview reload) pass straight through
  e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(SHELL).then((s) => s.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
