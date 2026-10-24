import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { NAV_ITEMS } from '@/constants/nav'

/** Thanh điều hướng dưới cùng, chỉ hiện trên điện thoại (< md). */
export default function BottomNav() {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-10 hidden border-t border-brand-100 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg max-md:block dark:border-white/10 dark:bg-[#12111c]/85"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ id, to, label, icon: Icon }) => (
          <li key={id}>
            <NavLink
              to={to}
              end={to === ROUTES.today}
              id={`tab-${id}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-500 dark:text-brand-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`rounded-full px-3.5 py-1 transition-all ${
                      isActive ? 'bg-brand-100 dark:bg-white/10' : ''
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
