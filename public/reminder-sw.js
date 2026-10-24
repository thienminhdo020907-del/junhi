/* eslint-disable */
// Chạy trong service worker (nạp qua workbox importScripts). JS thuần, không build.
// Đọc IndexedDB 'junhi' trực tiếp (cùng DB với Dexie) để quyết định có nhắc hay không.

const REMINDER_TAG = 'daily-reminder'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('junhi')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function todayKey(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

async function checkReminder() {
  const db = await openDb()
  try {
    if (!db.objectStoreNames.contains('settings') || !db.objectStoreNames.contains('entries')) return

    const settings = db.transaction('settings', 'readonly').objectStore('settings')
    const cfg = (await wrap(settings.get('reminder')))?.value
    if (!cfg || !cfg.enabled) return

    const now = new Date()
    const today = todayKey(now)
    const [h, m] = String(cfg.time || '21:00').split(':').map(Number)
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return

    const last = (await wrap(settings.get('reminderLastNotified')))?.value
    if (last === today) return

    const entry = await wrap(
      db.transaction('entries', 'readonly').objectStore('entries').index('date').get(today),
    )
    if (entry) return

    await self.registration.showNotification('Junhi', {
      body: 'Hôm nay bạn thế nào?',
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: REMINDER_TAG,
      data: { url: '/' },
    })

    await wrap(
      db.transaction('settings', 'readwrite').objectStore('settings').put({
        key: 'reminderLastNotified',
        value: today,
      }),
    )
  } finally {
    db.close()
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === REMINDER_TAG) event.waitUntil(checkReminder())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
