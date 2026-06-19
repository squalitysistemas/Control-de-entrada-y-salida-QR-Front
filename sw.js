const CACHE_VERSION = 'v2';
const CACHE_NAME = `checador-${CACHE_VERSION}`;
const ASSETS = [
  '/Control-de-entrada-y-salida-QR-Front/',
  '/Control-de-entrada-y-salida-QR-Front/index.html',
  '/Control-de-entrada-y-salida-QR-Front/libs/tailwind.js',
  '/Control-de-entrada-y-salida-QR-Front/libs/html5-qrcode.js',
  '/Control-de-entrada-y-salida-QR-Front/libs/lucide.js',
  '/Control-de-entrada-y-salida-QR-Front/libs/face-api.js',
];

// Instalar y cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Activa el nuevo SW de inmediato, sin esperar a que se cierren las pestañas
});

// Limpiar caches viejos cuando se activa una nueva versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Toma control de todas las pestañas abiertas inmediatamente
  );
});

// Estrategia: Network first (siempre intenta traer la versión más reciente del servidor)
// Si no hay internet, usa la copia en caché como respaldo
self.addEventListener('fetch', event => {
  // No cachear llamadas al API
  if (event.request.url.includes('/api/')) return;

  // Solo cachear peticiones GET (evita errores con POST, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde bien, actualiza el caché con la versión más reciente
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Si no hay internet, usa lo que esté en caché
        return caches.match(event.request).then(cached => {
          return cached || caches.match('/Control-de-entrada-y-salida-QR-Front/index.html');
        });
      })
  );
});