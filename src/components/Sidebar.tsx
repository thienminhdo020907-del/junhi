import { NavLink } from 'react-router-dom'
import { APP_NAME, ROUTES } from '@/constants/app'
import { NAV_ITEMS } from '@/constants/nav'

/**
 * Sidebar trái. Desktop (>= lg): đầy đủ chữ. Tablet (md–lg): chỉ icon. Điện thoại (< md): ẩn, dùng BottomNav.
 */
export default function Sidebar() {
  return (
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

      <div className="mt-auto space-y-3 px-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts-modal'))}
          className="flex w-full items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-brand-100 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white max-lg:justify-center"
          title="Xem phím tắt [?]"
        >
          <span className="font-mono text-xs font-bold">⌨ ?</span>
          <span className="max-lg:hidden text-[11px]">Phím tắt</span>
        </button>
        <p className="text-[11px] text-slate-400 max-lg:hidden">
          Dữ liệu lưu trên thiết bị của bạn.
        </p>
      </div>
    </aside>
  )
}
