import { useState } from 'react'
import { useEntriesInRange } from '@/db/useEntries'
import { addDays, isSameDay, startOfWeek, toKey, WEEKDAY_SHORT } from '@/lib/date'
import { moodColor, type Mood } from '@/lib/mood'

interface Props {
  date: Date
  onOpenDay: (d: Date) => void
}

const W = 300
const H = 110
const PAD_X = 22
const PAD_Y = 14

export default function WeekView({ date, onOpenDay }: Props) {
  const start = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const entries = useEntriesInRange(toKey(days[0]), toKey(days[6]))
  const [today] = useState(() => new Date())

  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / 6
  const y = (m: Mood) => PAD_Y + ((5 - m) * (H - PAD_Y * 2)) / 4

  const points = days
    .map((d, i) => {
      const e = entries?.get(toKey(d))
      return e ? { i, mood: e.mood } : null
    })
    .filter((p): p is { i: number; mood: Mood } => p !== null)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const e = entries?.get(toKey(d))
          const isToday = isSameDay(d, today)
          return (
            <button
              key={i}
              type="button"
              id={`week-day-${toKey(d)}`}
              onClick={() => onOpenDay(d)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {WEEKDAY_SHORT[i]}
              </span>
              <span
                className={`flex aspect-[3/4] w-full items-center justify-center rounded-xl text-sm font-semibold border-[1.5px] border-[var(--border)] ${
                  isToday ? 'ring-2 ring-[var(--border-strong)] border-[var(--border-strong)]' : ''
                } ${e ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}
                style={{ background: e ? moodColor(e.mood) : 'var(--empty-cell)' }}
              >
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <div className="card">
        <p className="mb-2 text-sm font-semibold">Biểu đồ tâm trạng tuần</p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Biểu đồ mood theo tuần"
        >
          {[1, 2, 3, 4, 5].map((m) => (
            <line
              key={m}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y(m as Mood)}
              y2={y(m as Mood)}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          ))}
          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points.map((p) => `${x(p.i)},${y(p.mood)}`).join(' ')}
            />
          )}
          {points.map((p) => (
            <circle
              key={p.i}
              cx={x(p.i)}
              cy={y(p.mood)}
              r={6}
              fill={moodColor(p.mood)}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {points.length === 0 && (
          <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
            Tuần này chưa có dữ liệu.
          </p>
        )}
      </div>
    </div>
  )
}
