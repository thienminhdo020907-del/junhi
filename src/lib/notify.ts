/** Tiện ích thông báo nhắc nhở bằng Notification API của trình duyệt. */

const REMINDER_TAG = 'daily-reminder'

export type PermissionState = NotificationPermission | 'unsupported'

export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window

export const getPermission = (): PermissionState =>
  notificationsSupported() ? Notification.permission : 'unsupported'

export async function requestPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'unsupported'
  }
}

export async function showReminderNotification(): Promise<boolean> {
  if (!notificationsSupported()) return false

  if (Notification.permission !== 'granted') {
    const res = await requestPermission()
    if (res !== 'granted') return false
  }

  // Ưu tiên dùng Service Worker registration nếu có sẵn
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg && 'showNotification' in reg) {
        await reg.showNotification('Junhi - Nhắc nhở', {
          body: 'Hôm nay bạn thế nào? Dành 1 phút ghi lại tâm trạng nhé!',
          icon: '/pwa-192x192.png',
          badge: '/pwa-64x64.png',
          tag: REMINDER_TAG,
          data: { url: '/' },
        })
        return true
      }
    } catch {
      // Fallback xuống Notification constructor
    }
  }

  try {
    const n = new Notification('Junhi - Nhắc nhở', {
      body: 'Hôm nay bạn thế nào? Dành 1 phút ghi lại tâm trạng nhé!',
      icon: '/pwa-192x192.png',
      tag: REMINDER_TAG,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
    return true
  } catch {
    return false
  }
}
