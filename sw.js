self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('pulsefit-cache-v1').then((cache) => {
      return cache.addAll([
        './index.html',
        './style.css',
        './script.js',
        './features.js',
        './database.js',
        './audio-game.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});