// Service worker for the installable Cut app (cutting.html).
// Scope is limited to /cutting* so the other dashboard pages are untouched.
// Network-first: you always get the latest version when online, and the
// cached copy when offline. Data lives in localStorage, so it works offline too.
const CACHE = 'cut-app-v1';
const FILES = ['/cutting.html', '/sync.js', '/topbar.js', '/cutting.webmanifest',
  '/icons/cutting-192.png', '/icons/cutting-512.png', '/icons/cutting.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('cut-app-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
