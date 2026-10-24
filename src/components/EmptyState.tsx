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
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-3xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
        <Icon size={32} className="stroke-[1.75]" />
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-[var(--accent-contrast)] shadow-xs">
          ✨
        </span>
      </div>

      <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--accent-contrast)] shadow-[2px_2px_0px_var(--border-strong)] transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <PenLine size={15} />
            <span>{actionLabel}</span>
          </Link>
        )}

        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] transition-all active:scale-95"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
