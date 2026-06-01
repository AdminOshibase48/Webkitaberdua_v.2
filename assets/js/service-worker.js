// ========================================
// SERVICE WORKER - PUSH NOTIFICATION
// ========================================

const CACHE_NAME = 'couple-dashboard-v2';
const OFFLINE_URL = '/offline.html';

// Cache core assets
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/offline.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/js/config.js',
    '/assets/js/utils.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match(OFFLINE_URL);
                }
            });
        })
    );
});

// ========================================
// PUSH NOTIFICATION
// ========================================

self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);
    
    let data = {
        title: '💕 Couple Love',
        body: 'Ada pesan baru dari pasanganmu!',
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-icon.png',
        tag: 'couple-message',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            url: '/index.html?action=chat'
        },
        actions: [
            { action: 'open', title: '💬 Buka Chat' },
            { action: 'close', title: 'Tutup' }
        ]
    };
    
    try {
        if (event.data) {
            const parsed = event.data.json();
            data.title = parsed.title || data.title;
            data.body = parsed.body || data.body;
            data.data.url = parsed.url || data.data.url;
        }
    } catch(e) {}
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            vibrate: data.vibrate,
            requireInteraction: data.requireInteraction,
            data: data.data,
            actions: data.actions
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click:', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/index.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
