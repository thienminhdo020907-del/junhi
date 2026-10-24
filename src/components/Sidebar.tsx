import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Cloud, CloudCheck, LogOut, RefreshCw } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { APP_NAME, ROUTES } from '@/constants/app'
import { NAV_ITEMS } from '@/constants/nav'
import { useAuth } from '@/context/useAuth'

/**
 * Sidebar trái. Desktop (>= lg): đầy đủ chữ. Tablet (md–lg): chỉ icon. Điện thoại (< md): ẩn, dùng BottomNav.
 */
export default function Sidebar() {
  const { user, isSyncing, syncData, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
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
        className="sticky top-0 z-10 flex h-dvh w-64 shrink-0 flex-col border-r border-brand-100 bg-white/70 px-4 py-6 backdrop-blur-lg dark:border-white/10 dark:bg-[#161524]/80 max-lg:w-[76px] max-lg:px-3 max-md:hidden"
      >
        <div className="mb-8 flex items-center gap-3 px-2 max-lg:justify-center max-lg:px-0">
          <img src="/favicon.svg" alt="" className="size-9 rounded-xl" />
          <div className="max-lg:hidden">
            <p className="text-lg font-bold leading-tight">{APP_NAME}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nhật ký & Mood</p>
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
                        ? 'bg-brand-100 text-brand-700 dark:bg-white/10 dark:text-brand-100'
                        : 'text-slate-500 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/5'
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
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-2 text-xs dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <CloudCheck size={14} className="shrink-0" />
                  <span className="truncate max-lg:hidden text-[11px]">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất"
                  className="rounded p-1 text-slate-400 hover:text-rose-500"
                >
                  <LogOut size={13} />
                </button>
              </div>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleManualSync}
                className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500/10 py-1 font-semibold text-brand-600 transition-colors hover:bg-brand-500/20 dark:text-brand-300 max-lg:hidden"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ đám mây'}</span>
              </button>

              {syncStatus && (
                <p className="mt-1 text-center text-[10px] text-emerald-600 dark:text-emerald-400 max-lg:hidden">
                  {syncStatus}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-brand-200 bg-white px-2.5 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15 max-lg:justify-center"
              title="Đăng nhập để đồng bộ đám mây"
            >
              <Cloud size={15} className="shrink-0 text-brand-500" />
              <span className="max-lg:hidden text-[11px]">Đăng nhập đồng bộ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts-modal'))}
            className="flex w-full items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/30 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-brand-100 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white max-lg:justify-center"
            title="Xem phím tắt [?]"
          >
            <span className="font-mono text-xs font-bold">⌨ ?</span>
            <span className="max-lg:hidden text-[11px]">Phím tắt</span>
          </button>
        </div>
      </aside>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
