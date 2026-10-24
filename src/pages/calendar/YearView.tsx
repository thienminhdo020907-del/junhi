import { useState, useMemo } from 'react'
import { Maximize2, Sparkles } from 'lucide-react'
import { useEntriesInRange } from '@/db/useEntries'
import { useMilestones } from '@/db/useMilestones'
import { isSameDay, MONTH_SHORT, toKey, weekdayIndex } from '@/lib/date'
import { moodColor } from '@/lib/mood'
import ExpandedYearHeatmapModal from '@/components/calendar/ExpandedYearHeatmapModal'

interface Props {
  date: Date
  onOpenDay: (d: Date) => void
}

export default function YearView({ date, onOpenDay }: Props) {
  const y = date.getFullYear()
  const jan1 = new Date(y, 0, 1)
  const offset = weekdayIndex(jan1)
  const entries = useEntriesInRange(`${y}-01-01`, `${y}-12-31`)
  const { milestones } = useMilestones(y)
  const [today] = useState(() => new Date())
  const [isExpanded, setIsExpanded] = useState(false)

  const milestonesByDate = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of milestones) {
      if (!map.has(m.date)) {
        map.set(m.date, m.emoji)
      }
    }
    return map
  }, [milestones])

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
    <>
      <div
        id="year-heatmap-card"
        title="Bấm để phóng to"
        onClick={() => setIsExpanded(true)}
        className="card relative cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
      >
        {/* Header với nút icon Phóng to */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text)]">
              Năm {y}
            </span>
            {milestones.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                <Sparkles size={10} /> {milestones.length} cột mốc
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Phóng to khung heatmap năm"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(true)
            }}
            className="flex size-7 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:text-[var(--text)] group-hover:border-[var(--border-strong)] transition-all shadow-xs"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="mb-2 grid gap-[2px] min-w-[580px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {MONTH_SHORT.map((label, mi) => {
              const col = Math.floor(
                (offset + Math.round((new Date(y, mi, 1).getTime() - jan1.getTime()) / 864e5)) / 7,
              )
              return (
                <span
                  key={label}
                  className="whitespace-nowrap text-[9px] text-[var(--text-muted)] font-medium"
                  style={{ gridColumnStart: col + 1, gridRowStart: 1 }}
                >
                  {label}
                </span>
              )
            })}
          </div>

          <div
            className="grid grid-flow-col grid-rows-7 gap-[2.5px] min-w-[580px]"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: offset }, (_, i) => (
              <span key={`b${i}`} />
            ))}
            {days.map((d) => {
              const k = toKey(d)
              const e = entries?.get(k)
              const milestoneEmoji = milestonesByDate.get(k)
              const isToday = isSameDay(d, today)

              return (
                <button
                  key={k}
                  type="button"
                  id={`year-day-${k}`}
                  aria-label={`${k}${milestoneEmoji ? ` (Cột mốc ${milestoneEmoji})` : ''}`}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    onOpenDay(d)
                  }}
                  className={`relative aspect-square rounded-[3px] transition-transform hover:scale-125 hover:z-10 focus:outline-none ${
                    isToday ? 'ring-1.5 ring-[var(--accent)] z-1' : ''
                  } ${
                    milestoneEmoji ? 'ring-1 ring-[var(--border-strong)] font-bold' : ''
                  }`}
                  style={{ background: e ? moodColor(e.mood) : 'var(--empty-cell)' }}
                >
                  {milestoneEmoji && (
                    <span className="absolute -top-1 -right-1 text-[8px] leading-none pointer-events-none">
                      {milestoneEmoji}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <p>
            {filled} ngày có nhật ký trong năm {y}
          </p>
          <span className="text-[11px] font-medium text-[var(--accent)] group-hover:underline flex items-center gap-1">
            Bấm để phóng to & xem cột mốc →
          </span>
        </div>
      </div>

      {/* Modal phóng to toàn màn hình */}
      <ExpandedYearHeatmapModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        initialYear={y}
      />
    </>
  )
}
