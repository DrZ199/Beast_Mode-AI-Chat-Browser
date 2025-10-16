// BeastMode PWA Service Worker
const CACHE_NAME = 'beastmode-v1.0.0';
const OFFLINE_URL = '/offline';

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline',
  // Static assets will be added dynamically
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('🚀 BeastMode Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 BeastMode Service Worker: Caching essential files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('✅ BeastMode Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ BeastMode Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('⚡ BeastMode Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ BeastMode Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ BeastMode Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and external requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Special handling for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If navigation fails (offline), serve cached index or offline page
          return caches.match('/') || caches.match('/offline');
        })
    );
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return cached response or error response for API calls
          return new Response(
            JSON.stringify({ 
              error: 'Offline - API unavailable',
              message: 'BeastMode is currently offline. Please check your connection.',
              offline: true
            }), 
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Cache-first strategy for other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Serve from cache
          return response;
        }
        
        // Fetch from network and cache
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response.ok) return response;
            
            // Clone response for caching
            const responseClone = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });
            
            return response;
          });
      })
      .catch(() => {
        // Fallback for failed requests
        if (event.request.destination === 'image') {
          return caches.match('/icons/icon-192x192.png');
        }
        
        return new Response('Offline - Resource unavailable', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Handle background sync for agent tasks (future enhancement)
self.addEventListener('sync', event => {
  console.log('🔄 BeastMode Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'agent-task-sync') {
    event.waitUntil(syncAgentTasks());
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', event => {
  console.log('🔔 BeastMode Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Agent task completed',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BeastMode', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('👆 BeastMode Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Background sync function (placeholder)
async function syncAgentTasks() {
  console.log('🤖 BeastMode Service Worker: Syncing agent tasks...');
  // Implementation for syncing incomplete agent tasks when back online
  // This would integrate with the IndexedDB storage for offline agent data
}

// Skip waiting and reload when new service worker is available
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ BeastMode Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
});