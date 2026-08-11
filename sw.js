const CACHE_NAME = 'emlak-studiom-v33';
const CORE_ASSETS = [
  './app.html',
  './styles.css',
  './main.js',
  './modules/canvas-core.js',
  './modules/ui-core.js',
  './modules/events.js',
  './assets/logo/logo-icon.png',
  './ui/pwa-install.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v20');
        // Use addAll safely - ignore failures for individual files
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // HARİCİ ORIGIN VE KASPERSKY KONTROLÜ
  // Kendi origin'imiz dışındaki istekleri (veya açıkça Kaspersky) cache mekanizmasından hariç tut.
  if (url.origin !== self.location.origin || url.hostname.includes('kaspersky-labs.com')) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        console.warn('Dış kaynaklı istek hatası (CORS/Ağ):', url.href, err);
        // Hata durumunda undefined yerine güvenli boş response dönerek 'Failed to convert value to Response' hatasını önle.
        return new Response(null, { status: 204, statusText: 'No Content' });
      })
    );
    return;
  }

  // 1. STATİK DOSYALAR İÇİN: Stale-While-Revalidate stratejisi
  const isStatic = url.pathname.match(/\.(js|css|html|json|png|jpg|jpeg|svg)$/i) || url.pathname.includes('/assets/');
  
  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        
        // Arka planda sunucuya gidip cache'i güncelle (Revalidate)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((err) => {
          // Offline isek veya hata varsa sessizce düş, catch bloğundan Response objesi döndür
          console.warn('Statik dosya ağ isteği başarısız:', url.href, err);
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        });

        // Cache varsa anında onu dön, yoksa mecburen ağdan inmeyi (fetchPromise) bekle.
        return cachedResponse || fetchPromise;
      }).catch((err) => {
        console.warn('Cache match hatası:', err);
        return new Response('', { status: 500, statusText: 'Cache Error' });
      })
    );
    return;
  }
  
  // 2. DİNAMİK İSTEKLER İÇİN: Network-First (Mevcut eski yapı)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch((err) => {
        console.warn('Dinamik istek başarısız (Network-First):', url.href, err);
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./app.html');
          }
          // Tüm denemeler başarısız olursa güvenli fallback
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        });
      })
  );
});
