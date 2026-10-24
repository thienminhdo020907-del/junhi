import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Cloud, CloudCheck, LogOut, RefreshCw } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/constants/app'
import { NAV_ITEMS } from '@/constants/nav'
import { useAuth } from '@/context/useAuth'

/**
 * Sidebar trái. Desktop (>= lg): đầy đủ chữ. Tablet (md–lg): chỉ icon. Điện thoại (< md): ẩn, dùng BottomNav.
 */
export default function Sidebar() {
  const { user, isSyncing, syncData, logout } = useAuth()
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const handleManualSync = async () => {
    try {
      const res = await syncData()
      setSyncStatus(`Đã đồng bộ! (+${res.downloaded} tải về, ${res.uploaded} tải lên)`)
      setTimeout(() => setSyncStatus(null), 3000)
    } catch {
      setSyncStatus('Lỗi đồng bộ')
      setTimeout(() => setSyncStatus(null), 3000)
    }
  }

  return (
    <>
      <aside
        aria-label="Thanh bên"
        className="sticky top-0 z-10 flex h-dvh w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-[var(--text)] max-lg:w-[76px] max-lg:px-3 max-md:hidden"
      >
        <div className="mb-8 flex items-center gap-3 px-2 max-lg:justify-center max-lg:px-0">
          <img src="/favicon.svg" alt="" className="size-9 rounded-xl" />
          <div className="max-lg:hidden">
            <p className="text-lg font-serif italic font-bold leading-tight text-[var(--text)]">{APP_NAME}</p>
            <p className="text-xs text-[var(--text-muted)]">Nhật ký & Mood</p>
          </div>
        </div>

        <nav aria-label="Điều hướng chính">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ id, to, label, icon: Icon }) => (
              <li key={id}>
                <NavLink
                  to={to}
                  end={to === ROUTES.today}
                  id={`side-${id}`}
                  title={label}
                  aria-label={label}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors max-lg:justify-center ${
                      isActive
                        ? 'bg-[var(--surface-2)] text-[var(--accent)] font-semibold border border-[var(--border)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="max-lg:hidden">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto space-y-2.5 px-2">
          {/* Mục Đám mây / Tài khoản */}
          {user ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-[var(--success)]">
                  <CloudCheck size={14} className="shrink-0" />
                  <span className="truncate max-lg:hidden text-[11px] text-[var(--text)]">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất"
                  className="rounded p-1 text-[var(--text-muted)] hover:text-rose-500"
                >
                  <LogOut size={13} />
                </button>
              </div>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleManualSync}
                className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)]/15 py-1 font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/25 max-lg:hidden"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ đám mây'}</span>
              </button>

              {syncStatus && (
                <p className="mt-1 text-center text-[10px] text-[var(--success)] max-lg:hidden">
                  {syncStatus}
                </p>
              )}
            </div>
          ) : (
            <Link
              to={ROUTES.login}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-xs font-semibold text-[var(--text)] shadow-2xs hover:bg-[var(--surface)] active:scale-95 max-lg:justify-center"
              title="Đăng nhập để đồng bộ đám mây"
            >
              <Cloud size={15} className="shrink-0 text-[var(--accent)]" />
              <span className="max-lg:hidden text-[11px]">Đăng nhập / Đăng ký</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts-modal'))}
            className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] max-lg:justify-center"
            title="Xem phím tắt [?]"
          >
            <span className="font-mono text-xs font-bold">⌨ ?</span>
            <span className="max-lg:hidden text-[11px]">Phím tắt</span>
          </button>
        </div>
      </aside>
    </>
  )
}
