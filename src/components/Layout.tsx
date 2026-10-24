import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { usePinLock } from '@/db/usePinLock'
import BottomNav from './BottomNav'
import PinScreen from './PinScreen'
import ReminderManager from './ReminderManager'
import ShortcutsModal from './ShortcutsModal'
import CozyHeader from './CozyHeader'
import CozyFooter from './CozyFooter'
import { DoodleStar, DoodleCloud, DoodleMoon } from './DoodleIcons'

export default function Layout() {
  const navigate = useNavigate()
  const { isPinEnabled, loading } = usePinLock()
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('junhi_unlocked') === 'true'
  })

  // Phím tắt toàn cục: N (Hôm nay), T/W/M/Y (chuyển chế độ xem Lịch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      if (key === 'n') {
        e.preventDefault()
        navigate(ROUTES.today)
      } else if (key === 't') {
        e.preventDefault()
        navigate(`${ROUTES.calendar}?view=day`)
      } else if (key === 'w') {
        e.preventDefault()
        navigate(`${ROUTES.calendar}?view=week`)
      } else if (key === 'm') {
        e.preventDefault()
        navigate(`${ROUTES.calendar}?view=month`)
      } else if (key === 'y') {
        e.preventDefault()
        navigate(`${ROUTES.calendar}?view=year`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleUnlock = () => {
    sessionStorage.setItem('junhi_unlocked', 'true')
    setIsUnlocked(true)
  }

  // Nếu đang bật mã PIN và chưa unlock trong session này
  if (!loading && isPinEnabled && !isUnlocked) {
    return <PinScreen onUnlock={handleUnlock} />
  }

  return (
    <div className="relative min-h-screen min-h-dvh w-full flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors selection:bg-[var(--pastel-pink)] selection:text-[var(--text)]">
      {/* Các họa tiết doodle vẽ tay mờ nằm rải rác nền, giảm độ sáng ở dark mode để không chói */}
      <div className="pointer-events-none fixed top-16 left-4 text-[var(--text)]/6 dark:text-[var(--text)]/4 -z-10 hidden md:block">
        <DoodleCloud size={70} />
      </div>
      <div className="pointer-events-none fixed top-44 right-8 text-[var(--pastel-butter)]/25 dark:text-[var(--pastel-butter)]/15 -z-10 hidden md:block">
        <DoodleStar size={40} />
      </div>
      <div className="pointer-events-none fixed bottom-24 left-10 text-[var(--pastel-mint)]/25 dark:text-[var(--pastel-mint)]/15 -z-10 hidden md:block">
        <DoodleMoon size={45} />
      </div>

      <CozyHeader />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-6 pb-20 max-md:pb-28">
        <ReminderManager />
        <Outlet />
      </main>

      <CozyFooter />
      <BottomNav />
      <ShortcutsModal />
    </div>
  )
}
