// Версия Service Worker - фиксированная версия для производительности
const SW_VERSION = '5.0.0'
const CACHE_NAME = `freedip-cache-${SW_VERSION}`

// При установке - удаляем все старые кэши и сразу активируемся
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', SW_VERSION)
  self.skipWaiting() // Сразу берем контроль
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Удаляем все старые кэши
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// При активации - очищаем старые кэши и берем контроль над всеми страницами
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', SW_VERSION)
  
  event.waitUntil(
    Promise.all([
      // Удаляем все старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // НЕ берем контроль сразу - это может блокировать навигацию
      // self.clients.claim() - отключено для предотвращения блокировки кликов
    ])
    // НЕ отправляем сообщение SW_UPDATED при активации
    // Это вызывало бесконечные перезагрузки
    // Перезагрузка будет только при реальном обновлении через updatefound
  )
})

// Обработка запросов - НЕ перехватываем навигационные запросы
// Это критично для OAuth редиректов на мобильных
self.addEventListener('fetch', (event) => {
  // КРИТИЧНО: НЕ перехватываем навигационные запросы (OAuth редиректы)
  if (event.request.mode === 'navigate') {
    // Пропускаем навигационные запросы напрямую - это важно для OAuth
    return
  }
  
  // Для остальных запросов тоже не перехватываем
  // Next.js сам управляет кэшированием через заголовки
  return
})

// Слушаем сообщения от клиентов
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
