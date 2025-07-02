const CACHE_NAME = 'slideshow-cache-v1';
const MEDIA_CACHE = 'slideshow-media-v1';

// Assets to cache immediately on install
const CRITICAL_ASSETS = [
  '/',
  '/video-slideshow/scene_1_1',
  // Add critical CSS and JS files
];

// Media file extensions to cache
const MEDIA_EXTENSIONS = ['.mp4', '.png', '.jpg', '.jpeg', '.webp', '.webm'];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MEDIA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if it's a media file
  const isMediaFile = MEDIA_EXTENSIONS.some(ext => 
    url.pathname.toLowerCase().includes(ext)
  );
  
  if (isMediaFile) {
    // Cache-first strategy for media files
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request).then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              // Clone the response before caching
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
  } else if (url.pathname.startsWith('/video-slideshow/')) {
    // Network-first strategy for slideshow pages
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Default: network-first for other requests
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Background sync for preloading assets
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_ASSETS') {
    const assets = event.data.assets;
    
    caches.open(MEDIA_CACHE).then((cache) => {
      assets.forEach((asset) => {
        fetch(asset)
          .then((response) => {
            if (response.status === 200) {
              cache.put(asset, response);
            }
          })
          .catch(() => {
            // Silently fail for preloading
            console.log(`Failed to preload: ${asset}`);
          });
      });
    });
  }
});

// Cleanup old cache entries periodically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    caches.open(MEDIA_CACHE).then((cache) => {
      cache.keys().then((requests) => {
        // Keep only the most recent 50 media files
        if (requests.length > 50) {
          const oldestRequests = requests.slice(0, requests.length - 50);
          oldestRequests.forEach((request) => {
            cache.delete(request);
          });
        }
      });
    });
  }
}); 