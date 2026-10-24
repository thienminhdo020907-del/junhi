import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { NAV_ITEMS } from '@/constants/nav'
import { playPopSound } from '@/lib/sound'

/** Thanh điều hướng dưới cùng cho điện thoại (< md), phong cách whimsical cozy */
export default function BottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-20 hidden border-t border-[var(--border)] bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md max-md:block"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 py-1">
        {NAV_ITEMS.map(({ id, to, label, icon: Icon }) => (
          <li key={id}>
            <NavLink
              to={to}
              end={to === ROUTES.today}
              id={`tab-${id}`}
              onClick={playPopSound}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-sans transition-all ${
                  isActive
                    ? 'text-[var(--text)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                      isActive
                        ? 'border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-butter)] text-[var(--text)] shadow-[1px_1.5px_0px_var(--border-strong)]'
                        : ''
                    }`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                  </span>
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
