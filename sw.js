const CACHE_NAME = 'equora-v4';
const ASSETS = ['index.html', 'script.js', 'manifest.json', 'assets/portada.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});