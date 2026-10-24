import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { addDays, addMonths, addYears, formatFullDate, fromKey, startOfWeek } from '@/lib/date'
import { MOOD_LABEL, MOODS, moodColor } from '@/lib/mood'
import { playPopSound } from '@/lib/sound'
import DayView from './calendar/DayView'
import MonthView from './calendar/MonthView'
import WeekView from './calendar/WeekView'
import YearView from './calendar/YearView'
import LifeView from './calendar/LifeView'

type View = 'day' | 'week' | 'month' | 'year' | 'life'

const VIEWS: { id: View; label: string; shortcut?: string }[] = [
  { id: 'day', label: 'ngày', shortcut: 'T' },
  { id: 'week', label: 'tuần', shortcut: 'W' },
  { id: 'month', label: 'tháng', shortcut: 'M' },
  { id: 'year', label: 'năm', shortcut: 'Y' },
  { id: 'life', label: 'đời' },
]

const fmt = (opts: Intl.DateTimeFormatOptions, d: Date) =>
  new Intl.DateTimeFormat('vi-VN', opts).format(d)

function rangeLabel(view: View, d: Date) {
  switch (view) {
    case 'day':
      return formatFullDate(d)
    case 'week': {
      const s = startOfWeek(d)
      const e = addDays(s, 6)
      return `${fmt({ day: 'numeric', month: 'numeric' }, s)} – ${fmt({ day: 'numeric', month: 'numeric', year: 'numeric' }, e)}`
    }
    case 'month':
      return fmt({ month: 'long', year: 'numeric' }, d)
    case 'year':
      return `Năm ${d.getFullYear()}`
    case 'life':
      return 'Cuộc đời qua từng tuần'
  }
}

export default function CalendarPage() {
  const [params, setParams] = useSearchParams()
  const dayParam = params.get('ngay')
  const viewParam = params.get('view') as View | null
  const validDay = dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) ? dayParam : null

  const [localView, setLocalView] = useState<View>('month')
  const view: View = validDay
    ? 'day'
    : viewParam && ['day', 'week', 'month', 'year', 'life'].includes(viewParam)
      ? viewParam
      : localView

  const changeView = (v: View) => {
    playPopSound()
    setLocalView(v)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('view', v)
        if (v !== 'day') next.delete('ngay')
        return next
      },
      { replace: true },
    )
  }

  const [date, setDate] = useState<Date>(() => (validDay ? fromKey(validDay) : new Date()))

  useEffect(() => {
    if (validDay) {
      setDate(fromKey(validDay))
    }
  }, [validDay])

  const shift = (delta: number) => {
    playPopSound()
    setDate((cur) => {
      switch (view) {
        case 'day':
          return addDays(cur, delta)
        case 'week':
          return addDays(cur, delta * 7)
        case 'month':
          return addMonths(cur, delta)
        case 'year':
          return addYears(cur, delta)
        default:
          return cur
      }
    })
  }

  const openDay = (d: Date) => {
    setDate(d)
    changeView('day')
  }

  const openWeek = (d: Date) => {
    setDate(d)
    changeView('week')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 select-none">
      <PageHeader title="Lịch dán sticker" subtitle="nhìn lại những ngày tháng êm đềm đã qua ✿" />

      {/* Tabs chế độ xem dạng Pill handmade */}
      <div
        role="tablist"
        aria-label="Chế độ xem"
        className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            id={`view-${v.id}`}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => changeView(v.id)}
            title={v.shortcut ? `Phím tắt: [${v.shortcut}]` : undefined}
            className={`rounded-full border-[1.5px] px-4 py-1.5 text-xs sm:text-sm font-sans transition-all hover:-translate-y-0.5 ${
              view === v.id
                ? 'border-[var(--border-strong)] bg-[var(--pastel-butter)] font-medium text-[var(--text)] shadow-[1.5px_2px_0px_var(--border-strong)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
            }`}
          >
            <span>✿ {v.label}</span>
            {v.shortcut && (
              <span className="ml-1 hidden font-mono text-[10px] opacity-40 sm:inline">
                ({v.shortcut})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Thanh điều hướng Trước / Sau */}
      <div className="flex items-center justify-between rounded-full border-[1.5px] border-[var(--border)] bg-[var(--surface)] px-4 py-2 shadow-sm">
        <button
          id="cal-prev"
          disabled={view === 'life'}
          onClick={() => shift(-1)}
          aria-label="Trước"
          title="Trước (←)"
          className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-[1px_2px_0px_var(--border-strong)] text-[var(--text)] transition-all disabled:invisible"
        >
          <ChevronLeft size={18} />
        </button>

        <h2 className="font-serif text-lg sm:text-xl italic text-[var(--text)] capitalize">
          {rangeLabel(view, date)}
        </h2>

        <button
          id="cal-next"
          disabled={view === 'life'}
          onClick={() => shift(1)}
          aria-label="Sau"
          title="Sau (→)"
          className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-[1px_2px_0px_var(--border-strong)] text-[var(--text)] transition-all disabled:invisible"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Nội dung theo chế độ */}
      {view === 'day' && <DayView date={date} />}
      {view === 'week' && <WeekView date={date} onOpenDay={openDay} />}
      {view === 'month' && <MonthView date={date} onOpenDay={openDay} />}
      {view === 'year' && <YearView date={date} onOpenDay={openDay} />}
      {view === 'life' && <LifeView onOpenWeek={openWeek} />}

      {/* Bảng chú thích màu sắc pastel */}
      {view !== 'day' && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-sans text-[var(--text-muted)] pt-2">
          {MOODS.map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <span
                className="size-3.5 rounded-full border border-[var(--border-strong)]"
                style={{ background: moodColor(m) }}
              />
              <span>{MOOD_LABEL[m]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
