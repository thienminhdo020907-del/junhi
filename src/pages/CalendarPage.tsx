import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { addDays, addMonths, addYears, formatFullDate, fromKey, startOfWeek } from '@/lib/date'
import { MOOD_LABEL, MOODS, moodColor } from '@/lib/mood'
import DayView from './calendar/DayView'
import MonthView from './calendar/MonthView'
import WeekView from './calendar/WeekView'
import YearView from './calendar/YearView'
import LifeView from './calendar/LifeView'

type View = 'day' | 'week' | 'month' | 'year' | 'life'

const VIEWS: { id: View; label: string; shortcut?: string }[] = [
  { id: 'day', label: 'Ngày', shortcut: 'T' },
  { id: 'week', label: 'Tuần', shortcut: 'W' },
  { id: 'month', label: 'Tháng', shortcut: 'M' },
  { id: 'year', label: 'Năm', shortcut: 'Y' },
  { id: 'life', label: 'Đời' },
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
      return 'Cuộc đời theo tuần'
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
    setLocalView(v)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('view', v)
        return next
      },
      { replace: true },
    )
  }

  const [date, setDate] = useState(() => (validDay ? fromKey(validDay) : new Date()))

  const shift = (dir: 1 | -1) =>
    setDate((d) => {
      switch (view) {
        case 'day':
          return addDays(d, dir)
        case 'week':
          return addDays(d, 7 * dir)
        case 'month':
          return addMonths(d, dir)
        case 'year':
          return addYears(d, dir)
        case 'life':
          return d
      }
    })

  // Phím tắt bàn phím: T (Ngày), W (Tuần), M (Tháng), Y (Năm), Mũi tên trái / phải
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      if (key === 't') {
        changeView('day')
      } else if (key === 'w') {
        changeView('week')
      } else if (key === 'm') {
        changeView('month')
      } else if (key === 'y') {
        changeView('year')
      } else if (e.key === 'ArrowLeft' && view !== 'life') {
        e.preventDefault()
        shift(-1)
      } else if (e.key === 'ArrowRight' && view !== 'life') {
        e.preventDefault()
        shift(1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const openDay = (d: Date) => {
    setDate(d)
    changeView('day')
  }

  const openWeek = (d: Date) => {
    setDate(d)
    changeView('week')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Lịch" subtitle="Xem lại các ngày đã qua" />

      {/* Tabs chế độ xem */}
      <div
        role="tablist"
        aria-label="Chế độ xem"
        className="mb-4 grid grid-cols-5 rounded-2xl bg-brand-100/60 p-1 dark:bg-white/10"
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            id={`view-${v.id}`}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => changeView(v.id)}
            title={v.shortcut ? `Phím tắt: [${v.shortcut}]` : undefined}
            className={`rounded-xl py-2 text-sm font-medium transition-all ${
              view === v.id
                ? 'bg-white text-brand-600 shadow-sm dark:bg-[#2b2845] dark:text-brand-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>{v.label}</span>
            {v.shortcut && (
              <span className="ml-1 hidden font-mono text-[10px] opacity-40 sm:inline">
                ({v.shortcut})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Thanh điều hướng Trước / Sau */}
      <div className="mb-4 flex items-center justify-between">
        <button
          id="cal-prev"
          disabled={view === 'life'}
          onClick={() => shift(-1)}
          aria-label="Trước"
          title="Trước (←)"
          className="rounded-full p-2 hover:bg-black/5 active:scale-90 disabled:invisible dark:hover:bg-white/10"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-center text-base font-semibold capitalize">{rangeLabel(view, date)}</h2>
        <button
          id="cal-next"
          disabled={view === 'life'}
          onClick={() => shift(1)}
          aria-label="Sau"
          title="Sau (→)"
          className="rounded-full p-2 hover:bg-black/5 active:scale-90 disabled:invisible dark:hover:bg-white/10"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Nội dung theo chế độ */}
      {view === 'day' && <DayView date={date} />}
      {view === 'week' && <WeekView date={date} onOpenDay={openDay} />}
      {view === 'month' && <MonthView date={date} onOpenDay={openDay} />}
      {view === 'year' && <YearView date={date} onOpenDay={openDay} />}
      {view === 'life' && <LifeView onOpenWeek={openWeek} />}

      {view !== 'day' && (
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          {MOODS.map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <span className="size-3 rounded-[4px]" style={{ background: moodColor(m) }} />
              {MOOD_LABEL[m]}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
