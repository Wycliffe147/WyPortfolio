self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('wyportfolio-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/styles.css', // Add other essential files to cache
        '/scripts.js'   // Add any JavaScript files
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
