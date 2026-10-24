import { Link } from 'react-router-dom'
import { PenLine, Sparkles, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/constants/app'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel = 'Viết nhật ký hôm nay',
  actionTo = ROUTES.today,
  secondaryLabel,
  secondaryTo,
}: EmptyStateProps) {
  return (
    <div className="card my-6 flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20 dark:bg-brand-400/15 dark:text-brand-300">
        <Icon size={32} className="stroke-[1.75]" />
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white shadow-xs">
          ✨
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95"
          >
            <PenLine size={15} />
            <span>{actionLabel}</span>
          </Link>
        )}

        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/15"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
