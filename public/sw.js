const CACHE_NAME = 'irib-dwp-v1'
const STATIC_CACHE = 'irib-static-v1'
const DYNAMIC_CACHE = 'irib-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
]

// Install event — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event — network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return

  // API requests — network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Static assets — cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, clone)
          })
          return response
        })
      })
    )
    return
  }

  // HTML pages — stale while revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              cache.put(request, response.clone())
              return response
            })
            .catch(() => {
              // Offline fallback
              return caches.match('/offline') || new Response('Offline', { status: 503 })
            })
          return cached || fetchPromise
        })
      })
    )
    return
  }

  // Default — network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clone)
        })
        return response
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormData())
  }
})

async function syncFormData() {
  // In production, this would read from IndexedDB and sync
  console.log('Syncing offline form data...')
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'پیام جدید دارید',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'مشاهده' },
      { action: 'dismiss', title: 'بستن' },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'پرتال IRIB', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    )
  }
})
