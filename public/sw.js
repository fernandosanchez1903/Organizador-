const CACHE_NAME = 'organizador-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/tareas/plato-sano.jpg',
  '/assets/tareas/plato-enfermo.jpg',
  '/assets/tareas/plato-muriendo.jpg',
  '/assets/tareas/bolsa-sano.jpg',
  '/assets/tareas/bolsa-enfermo.jpg',
  '/assets/tareas/bolsa-muriendo.jpg',
  '/assets/tareas/baño-sano.jpg',
  '/assets/tareas/baño-enfermo.jpg',
  '/assets/tareas/baño-muriendo.jpg',
  '/assets/tareas/escoba-sano.jpg',
  '/assets/tareas/escoba-enfermo.jpg',
  '/assets/tareas/escoba-muriendo.jpg',
  '/assets/tareas/mancuerna-sano.jpg',
  '/assets/tareas/mancuerna-enfermo.jpg',
  '/assets/tareas/mancuerna-muriendo.jpg',
  '/assets/tareas/carta-sano.jpg',
  '/assets/tareas/carta-enfermo.jpg',
  '/assets/tareas/carta-muriendo.jpg',
  '/assets/tareas/tarjeta-sano.jpg',
  '/assets/tareas/tarjeta-enfermo.jpg',
  '/assets/tareas/tarjeta-muriendo.jpg',
]

// Precachea todos los recursos al instalar y toma control inmediato sin esperar al cierre de tabs.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Al activar, elimina cualquier caché con nombre distinto al actual (versiones viejas).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Cache-first: sirve desde caché si existe; si no, va a la red.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
