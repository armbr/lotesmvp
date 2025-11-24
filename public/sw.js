const CACHE = 'loteadora-shell-v1'
const FILES = ['/', '/manifest.json', '/icon-192.png']

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)))
  self.skipWaiting()
})

self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return
  evt.respondWith(caches.match(evt.request).then((r) => r || fetch(evt.request)))
})
