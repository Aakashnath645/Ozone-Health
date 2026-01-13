const CACHE_NAME = 'ozone-v1';

self.addEventListener('install', (event) => {
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
  const url = new URL(event.request.url);

  // REAL-TIME REQUIREMENT: 
  // Bypass cache for all data APIs to ensure users always get the latest GPS/Weather/AQI data.
  if (url.origin.includes('api.open-meteo.com') || 
      url.origin.includes('nominatim.openstreetmap.org') ||
      url.origin.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // PWA LOGIC:
  // Cache-First strategy for static assets (CDN scripts, images, styles) to speed up load times.
  // Network-First for HTML to ensure latest app version.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // Cache the new resource for next time
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});