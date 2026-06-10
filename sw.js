const CACHE_NAME = 'checador-v1';
const urlsToCache = [
  './',
  './index.html',
  './libs/tailwind.js',
  './libs/lucide.js',
  './libs/face-api.js',
  './libs/html5-qrcode.js',
  './libs/models/tiny_face_detector_model-weights_manifest.json',
  './libs/models/tiny_face_detector_model.bin'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
