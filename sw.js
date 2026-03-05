const CACHE_NAME = 'equora-cache-v10'; 
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './manifest.json',
  './assets/portada.png',
  './assets/logo192.png',
  './assets/logo512.png',
  './assets/FAUNA1.png', './assets/FAUNA2.png', './assets/FAUNA3.png',
  './assets/FAUNA4.png', './assets/FAUNA5.png', './assets/FAUNA6.png',
  './assets/FAUNA7.png', './assets/FAUNA8.png', './assets/FAUNA9.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  }));
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});