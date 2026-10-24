import { useState } from 'react'
import { useEntriesInRange } from '@/db/useEntries'
import { daysInMonth, isSameDay, toKey, WEEKDAY_SHORT, weekdayIndex } from '@/lib/date'
import { moodColor } from '@/lib/mood'

interface Props {
  date: Date
  onOpenDay: (d: Date) => void
}

export default function MonthView({ date, onOpenDay }: Props) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const total = daysInMonth(y, m)
  const offset = weekdayIndex(new Date(y, m, 1))
  const entries = useEntriesInRange(toKey(new Date(y, m, 1)), toKey(new Date(y, m, total)))
  const [today] = useState(() => new Date())

  return (
    <div className="card">
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
        {WEEKDAY_SHORT.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const d = new Date(y, m, i + 1)
          const e = entries?.get(toKey(d))
          return (
            <button
              key={i}
              type="button"
              id={`month-day-${toKey(d)}`}
              onClick={() => onOpenDay(d)}
              aria-label={`Ngày ${i + 1}`}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-transform active:scale-90 ${
                isSameDay(d, today) ? 'ring-2 ring-brand-500' : ''
              } ${e ? 'text-black/70' : 'text-slate-500 dark:text-slate-400'}`}
              style={{ background: e ? moodColor(e.mood) : 'var(--empty-cell)' }}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
