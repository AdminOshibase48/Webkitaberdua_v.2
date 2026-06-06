// service-worker.js - DENGAN AUTO UPDATE
const CACHE_NAME = 'ourstory-v2';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/offline.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/js/config.js',
    '/assets/js/utils.js',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Install - Version 2');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Activate event - CLEAN OLD CACHE
self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Menghapus cache lama:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - NETWORK FIRST, CACHE FALLBACK (UNTUK UPDATE OTOMATIS)
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Untuk HTML files - Network First
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the new version
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then(cached => {
                        return cached || caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }
    
    // Untuk assets - Cache First, Network Fallback
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(network => {
                // Cache network response for future
                const responseClone = network.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return network;
            });
        })
    );
});

// CHECK FOR UPDATE (SETIAP 1 JAM)
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodically check for updates
setInterval(() => {
    console.log('[SW] Checking for updates...');
    self.registration.update();
}, 3600000); // 1 jam

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click');
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Push notification
self.addEventListener('push', event => {
    console.log('[SW] Push received');
    
    let data = {
        title: '💕 Our Story',
        body: 'Ada pesan baru dari pasanganmu!',
        icon: '/assets/images/icon-192x192.png',
        tag: 'couple-message'
    };
    
    if (event.data) {
        try {
            const parsed = event.data.json();
            data.title = parsed.title || data.title;
            data.body = parsed.body || data.body;
        } catch(e) {}
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            tag: data.tag,
            vibrate: [200, 100, 200],
            requireInteraction: true
        })
    );
});
