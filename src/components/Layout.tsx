import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { usePinLock } from '@/db/usePinLock'
import BottomNav from './BottomNav'
import PinScreen from './PinScreen'
import ReminderManager from './ReminderManager'
import ShortcutsModal from './ShortcutsModal'
import Sidebar from './Sidebar'

import RetroWin95Wrapper from './RetroWin95Wrapper'

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
    <RetroWin95Wrapper>
      <div className="flex min-h-dvh">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 sm:px-8 pt-6 pb-12 max-md:pb-28">
          <div className="mx-auto w-full max-w-5xl">
            <ReminderManager />
            <Outlet />
          </div>
        </main>
        <BottomNav />
        <ShortcutsModal />
      </div>
    </RetroWin95Wrapper>
  )
}

