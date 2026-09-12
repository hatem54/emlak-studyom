const CACHE_NAME = 'emlak-studiom-v204-20260912-9';
const CORE_ASSETS = [
  './app.html',
  './styles.css',
  './main.js',
  './js/searchManager.js',
  './modules/webgl-photo-engine.js',
  './modules/photo.js',
  './modules/colors.js',
  './modules/photo-curves.js',
  './modules/photo-masks.js',
  './modules/voiceover-studio.js',
  './modules/satellite-map.js',
  './modules/ai-enhancer.js',
  './modules/canvas-core.js',
  './modules/ui-core.js',
  './modules/events.js',
  './modules/ai-vision.js',
  './modules/other-callouts.js',
  './assets/logo/logo-icon.png',
  './ui/pwa-install.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache', CACHE_NAME);
        return Promise.allSettled(
          CORE_ASSETS.map(url => cache.add(url).catch(err => console.log('Cache failed for', url, err)))
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini işle
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // 🛡️ HARİCİ ORIGINLER (Cloudflare Worker, Supabase, Google vb.) TARAYICIYA BIRAKILIR, ASLA ENGELLENMEZ
  if (url.origin !== self.location.origin) {
    return;
  }

  // YEREL DOSYALAR İÇİN: Her zaman en güncel dosyayı çek (Network-First), internet yoksa cache'den ver
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
