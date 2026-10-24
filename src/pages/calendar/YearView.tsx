import { useState } from 'react'
import { useEntriesInRange } from '@/db/useEntries'
import { isSameDay, MONTH_SHORT, toKey, weekdayIndex } from '@/lib/date'
import { moodColor } from '@/lib/mood'

interface Props {
  date: Date
  onOpenDay: (d: Date) => void
}

export default function YearView({ date, onOpenDay }: Props) {
  const y = date.getFullYear()
  const jan1 = new Date(y, 0, 1)
  const offset = weekdayIndex(jan1)
  const entries = useEntriesInRange(`${y}-01-01`, `${y}-12-31`)
  const [today] = useState(() => new Date())

  const days: Date[] = []
  for (
    let d = new Date(y, 0, 1);
    d.getFullYear() === y;
    d = new Date(y, d.getMonth(), d.getDate() + 1)
  ) {
    days.push(d)
  }
  const cols = Math.ceil((offset + days.length) / 7)

  const filled = entries?.size ?? 0

  return (
    <div className="card">
      <div className="mb-2 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {MONTH_SHORT.map((label, mi) => {
          const col = Math.floor(
            (offset + Math.round((new Date(y, mi, 1).getTime() - jan1.getTime()) / 864e5)) / 7,
          )
          return (
            <span
              key={label}
              className="whitespace-nowrap text-[9px] text-slate-500 dark:text-slate-400"
              style={{ gridColumnStart: col + 1, gridRowStart: 1 }}
            >
              {label}
            </span>
          )
        })}
      </div>
      <div
        className="grid grid-flow-col grid-rows-7 gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: offset }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {days.map((d) => {
          const k = toKey(d)
          const e = entries?.get(k)
          return (
            <button
              key={k}
              type="button"
              id={`year-day-${k}`}
              aria-label={k}
              onClick={() => onOpenDay(d)}
              className={`aspect-square rounded-[3px] ${isSameDay(d, today) ? 'ring-1 ring-brand-500' : ''}`}
              style={{ background: e ? moodColor(e.mood) : 'var(--empty-cell)' }}
            />
          )
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {filled} ngày có nhật ký trong năm {y}
      </p>
    </div>
  )
}
