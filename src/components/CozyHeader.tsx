import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Volume2, VolumeX, Sun, Moon, Cloud, CloudCheck } from 'lucide-react'
import { ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'
import { isSoundEnabled, setSoundEnabled, playPopSound } from '@/lib/sound'

export default function CozyHeader() {
  const { user } = useAuth()
  const [soundOn, setSoundOn] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setSoundOn(isSoundEnabled())
    const isDarkMode = document.documentElement.classList.contains('dark') || 
      document.body.getAttribute('data-theme') === 'dark' ||
      localStorage.getItem('junhi_theme') === 'dark'
    setIsDark(isDarkMode)
  }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  const toggleTheme = () => {
    playPopSound()
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      document.body.setAttribute('data-theme', 'dark')
      localStorage.setItem('junhi_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.removeAttribute('data-theme')
      localStorage.setItem('junhi_theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#2B2724]/10 bg-[#F3F1EC]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#1F1C1A]/90 transition-colors">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo trộn 2 kiểu chữ: sans-serif nhỏ + serif nghiêng đậm */}
        <Link
          to={ROUTES.today}
          onClick={playPopSound}
          className="group flex items-baseline gap-1.5 transition-transform hover:-translate-y-0.5"
        >
          <span className="font-sans text-xs tracking-wider text-[#7A736B] dark:text-[#A8A199] lowercase">a little</span>
          <span className="font-serif text-2xl sm:text-3xl font-normal italic text-[#2B2724] dark:text-[#EDE8E3]">
            junhi
          </span>
          <span className="text-sm text-[#F4C6D0] transition-transform group-hover:rotate-45 inline-block">✿</span>
        </Link>

        {/* Thanh điều hướng chính (Pill Nav) */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {[
            { to: ROUTES.today, label: 'hôm nay' },
            { to: ROUTES.calendar, label: 'lịch' },
            { to: ROUTES.journal, label: 'nhật ký' },
            { to: ROUTES.stats, label: 'thống kê' },
            { to: ROUTES.settings, label: 'cài đặt' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.today}
              onClick={playPopSound}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 text-xs sm:text-sm font-sans transition-all ${
                  isActive
                    ? 'border-[1.5px] border-[#2B2724] bg-[#FBFAF7] font-medium text-[#2B2724] shadow-[2px_2px_0px_#2B2724] dark:border-white/40 dark:bg-[#282421] dark:text-[#EDE8E3] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]'
                    : 'text-[#7A736B] hover:text-[#2B2724] hover:bg-black/5 dark:text-[#A8A199] dark:hover:text-[#EDE8E3] dark:hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Các nút tùy chỉnh: Âm thanh Lo-fi + Dark Mode + Tài khoản */}
        <div className="flex items-center gap-2">
          {/* Nút bật âm thanh lo-fi */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? 'Tắt âm thanh lo-fi' : 'Bật âm thanh để có trải nghiệm ấm áp nhất'}
            className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 text-xs font-sans transition-all hover:-translate-y-0.5 ${
              soundOn
                ? 'border-[#2B2724] bg-[#CFE3DD] text-[#2B2724] shadow-[1.5px_2px_0px_#2B2724]'
                : 'border-[#2B2724]/30 bg-[#FBFAF7] text-[#7A736B] hover:border-[#2B2724] dark:border-white/20 dark:bg-[#282421] dark:text-[#A8A199]'
            }`}
          >
            {soundOn ? (
              <>
                <Volume2 size={13} className="text-[#2B2724] animate-pulse" />
                <span className="hidden sm:inline">✿ lo-fi đang bật</span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span className="hidden sm:inline">bật âm thanh ✿</span>
              </>
            )}
          </button>

          {/* Nút chuyển chế độ sáng / tối (Cozy Cream / Cozy Night) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Chuyển sang nền kem ấm' : 'Chuyển sang đêm tĩnh lặng'}
            className="flex size-7 items-center justify-center rounded-full border-[1.5px] border-[#2B2724]/30 bg-[#FBFAF7] text-[#2B2724] hover:border-[#2B2724] hover:shadow-[1.5px_2px_0px_#2B2724] transition-all dark:border-white/30 dark:bg-[#282421] dark:text-[#EDE8E3]"
          >
            {isDark ? <Sun size={13} className="text-[#F6E3A8]" /> : <Moon size={13} className="text-[#7A736B]" />}
          </button>

          {/* Nút Đăng nhập / Tài khoản */}
          {user ? (
            <Link
              to={ROUTES.settings}
              onClick={playPopSound}
              title={`Đã đăng nhập: ${user.email}`}
              className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[#2B2724] bg-[#CFE3DD] px-2.5 py-1 text-xs font-sans text-[#2B2724] shadow-[1.5px_2px_0px_#2B2724] hover:-translate-y-0.5 transition-all"
            >
              <CloudCheck size={13} className="text-[#2B2724]" />
              <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              to={ROUTES.login}
              onClick={playPopSound}
              id="header-login-btn"
              className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[#2B2724] bg-[#F4C6D0] px-3 py-1 text-xs font-sans font-medium text-[#2B2724] shadow-[1.5px_2px_0px_#2B2724] hover:-translate-y-0.5 transition-all"
            >
              <Cloud size={13} />
              <span>đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
