Permite usar la app sin conexión durante partidas de 30 minutos.
const CACHE_NAME = 'fauna-v2';
const assets = ['index.html', 'script.js', 'manifest.json', 'assets/portada.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});