import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BellRing, Sparkles, X } from 'lucide-react'
import { ROUTES } from '@/constants/app'
import { timeToMinutes, useReminder } from '@/db/useReminder'
import { useEntriesInRange } from '@/db/useEntries'
import { toKey } from '@/lib/date'
import { showReminderNotification } from '@/lib/notify'

const DISMISS_KEY = 'junhi.reminderDismissed'

export default function ReminderManager() {
  const { loading, settings, lastNotified, markNotified } = useReminder()
  const [now, setNow] = useState(() => new Date())
  const [dismissedDate, setDismissedDate] = useState(() => localStorage.getItem(DISMISS_KEY))
  const location = useLocation()

  // Kiểm tra thời gian mỗi 15 giây hoặc khi người dùng quay lại tab
  useEffect(() => {
    const tick = () => setNow(new Date())
    const interval = setInterval(tick, 15_000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])

  const today = toKey(now)
  const entries = useEntriesInRange(today, today)
  const isLoaded = !loading && entries !== undefined
  const hasCheckedInToday = isLoaded && entries.has(today)

  // 1. Kích hoạt Notification API khi tab đang mở và đến giờ nhắc
  useEffect(() => {
    if (!isLoaded || !settings.enabled || hasCheckedInToday) return

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const targetMinutes = timeToMinutes(settings.time)

    // Nếu đã tới hoặc qua giờ nhắc và hôm nay chưa gửi thông báo
    if (currentMinutes >= targetMinutes && lastNotified !== today) {
      void markNotified(today)
      void showReminderNotification()
    }
  }, [isLoaded, settings, hasCheckedInToday, now, lastNotified, today, markNotified])

  // Không hiện banner nếu:
  // - Đang tải dữ liệu
  // - Hôm nay ĐÃ check-in
  // - Người dùng đã bấm ẩn banner trong ngày hôm nay
  // - Hoặc đang ở ngay trang "Hôm nay"
  if (
    !isLoaded ||
    hasCheckedInToday ||
    dismissedDate === today ||
    location.pathname === ROUTES.today
  ) {
    return null
  }

  return (
    <div
      id="reminder-banner"
      role="status"
      className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 p-4 text-white shadow-md transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
          <BellRing size={20} className="animate-bounce" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Hôm nay bạn thế nào?</p>
          <p className="text-xs text-white/80">Bạn chưa check-in nhật ký và tâm trạng hôm nay.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={ROUTES.today}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-xs transition-transform active:scale-95"
        >
          <Sparkles size={13} />
          Ghi ngay
        </Link>
        <button
          type="button"
          aria-label="Để sau"
          title="Để sau"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, today)
            setDismissedDate(today)
          }}
          className="rounded-xl p-1.5 text-white/70 hover:bg-white/15 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
