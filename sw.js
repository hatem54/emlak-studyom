const CACHE_NAME = 'emlak-studiom-v206-20260913-52';
const CORE_ASSETS = [
  './core/utils.js',
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache', CACHE_NAME);
        return Promise.allSettled(
          CORE_ASSETS.map(url => cache.add(url).catch(err => console.log('Cache failed for', url, err)))
        );
      })
  );
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

  // Chrome only-if-cached veya DevTools önbellek denetimlerini tarayıcıya bırak
  if (event.request.cache === 'only-if-cached') {
    return;
  }

  const url = new URL(event.request.url);

  // 🛡️ Harici originler (Cloudflare Worker, Supabase, Google vb.) tarayıcıya bırakılır
  if (url.origin !== self.location.origin) {
    return;
  }

  // 🛡️ Localhost / 127.0.0.1 geliştirme ortamında HTML ve navigasyon isteklerini doğrudan tarayıcıya bırak (ERR_CACHE_MISS riskini sıfırlar)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
      return;
    }
  }

  // 🛡️ Navigasyon (Canlı/Prodüksiyon ortamı)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const appCached = await caches.match('./app.html') || await caches.match('app.html');
        return appCached || new Response('Çevrimdışı', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // 🛡️ Yerel Statik Dosyalar (CSS, JS, Resimler vb.): Network-First
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        // Asla undefined dönme; Chrome'un ERR_CACHE_MISS vermesini önle
        return new Response('', { status: 404, statusText: 'Not Found in Cache' });
      })
  );
});

