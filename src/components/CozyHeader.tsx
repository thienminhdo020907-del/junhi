import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Volume2, VolumeX, Sun, Moon, Cloud, CloudCheck } from 'lucide-react'
import { ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'
import { useTheme } from '@/context/useTheme'
import { isSoundEnabled, setSoundEnabled, playPopSound } from '@/lib/sound'

export default function CozyHeader() {
  const { user } = useAuth()
  const { isDark, setIsDark } = useTheme()
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    setSoundOn(isSoundEnabled())
  }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  const toggleTheme = () => {
    playPopSound()
    setIsDark(!isDark)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo trộn 2 kiểu chữ: sans-serif nhỏ + serif nghiêng đậm */}
        <Link
          to={ROUTES.today}
          onClick={playPopSound}
          className="group flex items-baseline gap-1.5 transition-transform hover:-translate-y-0.5"
        >
          <span className="font-sans text-xs tracking-wider text-[var(--text-muted)] lowercase">a little</span>
          <span className="font-serif text-2xl sm:text-3xl font-normal italic text-[var(--text)]">
            junhi
          </span>
          <span className="text-sm text-[var(--pastel-pink)] transition-transform group-hover:rotate-45 inline-block">✿</span>
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
                    ? 'border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] font-medium text-[var(--text)] shadow-[2px_2px_0px_var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--text)]/5'
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
                ? 'border-[var(--border-strong)] bg-[var(--pastel-mint)] text-[var(--text)] shadow-[1.5px_2px_0px_var(--border-strong)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
            }`}
          >
            {soundOn ? (
              <>
                <Volume2 size={13} className="text-[var(--text)] animate-pulse" />
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
            id="theme-toggle-btn"
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            aria-pressed={isDark}
            title={isDark ? 'Chuyển sang nền kem ấm' : 'Chuyển sang đêm tĩnh lặng'}
            className="flex size-7 items-center justify-center rounded-full border-[1.5px] border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)] hover:shadow-[1.5px_2px_0px_var(--border-strong)] transition-all"
          >
            {isDark ? <Sun size={13} className="text-[var(--pastel-butter)]" /> : <Moon size={13} className="text-[var(--text-muted)]" />}
          </button>

          {/* Nút Đăng nhập / Tài khoản */}
          {user ? (
            <Link
              to={ROUTES.settings}
              onClick={playPopSound}
              title={`Đã đăng nhập: ${user.email}`}
              className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-mint)] px-2.5 py-1 text-xs font-sans text-[var(--text)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 transition-all"
            >
              <CloudCheck size={13} className="text-[var(--text)]" />
              <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              to={ROUTES.login}
              onClick={playPopSound}
              id="header-login-btn"
              className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-pink)] px-3 py-1 text-xs font-sans font-medium text-[var(--text)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 transition-all"
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
