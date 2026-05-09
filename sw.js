const CACHE = 'pkg-tracker-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install — cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Skip external CDN requests — let them load normally
  if (e.request.url.includes('cdn.jsdelivr.net') || e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) return;
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
    )
  );
});
