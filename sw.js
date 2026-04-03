/* ================================================
   Service Worker — Between the Waves
   App shell cached on install; audio cached on demand
   ================================================ */

const SHELL_CACHE = 'btw-shell-v3';
const AUDIO_CACHE = 'btw-audio-v1';

const SHELL_FILES = [
  './',
  './css/style.css',
  './js/player.js',
  './js/listen.js',
  './js/share.js',
  './js/offline.js',
  './fonts/cormorant-garamond-v21-latin-regular.woff2',
  './fonts/cormorant-garamond-v21-latin-italic.woff2',
  './images/hero.jpeg',
  './site.webmanifest'
];

/* ── Install: pre-cache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

/* ── Activate: remove outdated caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== AUDIO_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: serve from cache where possible ── */
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);

  // Audio files: serve from audio cache if saved, else network
  if (url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(event.request).then(cached => cached || fetch(event.request))
      )
    );
    return;
  }

  // Everything else: cache-first (shell), fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
