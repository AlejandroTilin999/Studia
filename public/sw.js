const CACHE_NAME = 'prepahid-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/phid_logo.webp',
  '/assets/logo-ph-blanco.webp',
  '/assets/alumna.webp',
  '/assets/hero-img.webp',
  '/assets/studia-logo.webp',
  '/assets/alumno-dashboard.webp',
  '/assets/docente-dashboard.webp',
  '/assets/admin-dashboard.webp'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de Fetch: Cache-First para imágenes y assets estáticos, Network-First para datos
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isImage = /\.(webp|png|jpg|jpeg|svg|ico)$/i.test(url.pathname) || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/storage/');

  if (isImage) {
    // Cache-First para imágenes: Respuesta instantánea desde caché local en 0ms
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidar en segundo plano de manera transparente
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First para navegación y datos
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
