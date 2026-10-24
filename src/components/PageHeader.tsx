import { Link } from 'react-router-dom'
import { Cloud, CloudCheck } from 'lucide-react'
import { ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth()

  return (
    <header className="mb-6 lg:mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="shrink-0 pt-1">
        {user ? (
          <Link
            to={ROUTES.settings}
            title={`Tài khoản: ${user.email} (Bấm để xem cài đặt đồng bộ)`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 transition-all active:scale-95 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CloudCheck size={14} className="text-emerald-500 shrink-0" />
            <span className="max-sm:hidden max-w-[130px] truncate">{user.email}</span>
            <span className="sm:hidden">Đã lưu</span>
          </Link>
        ) : (
          <Link
            to={ROUTES.login}
            id="header-login-btn"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all"
            title="Đăng nhập để đồng bộ dữ liệu"
          >
            <Cloud size={14} />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  )
}
