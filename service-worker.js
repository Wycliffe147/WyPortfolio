self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('wyportfolio-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
        // Only include files that actually exist
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
