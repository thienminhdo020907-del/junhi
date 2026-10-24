import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  BookOpen,
  Moon,
  Zap,
  Filter,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Entry } from '@/db/db'
import { useAllEntries } from '@/db/useEntries'
import {
  useMilestones,
  MILESTONE_TYPES,
  type Milestone,
  type MilestoneType,
} from '@/db/useMilestones'
import {
  formatFullDate,
  fromKey,
  isSameDay,
  MONTH_SHORT,
  toKey,
} from '@/lib/date'
import { MOOD_LABEL, moodColor, type Mood } from '@/lib/mood'
import MilestoneModal from './MilestoneModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialYear?: number
}

type ViewMode = 'months' | 'weeks'

export default function ExpandedYearHeatmapModal({
  isOpen,
  onClose,
  initialYear,
}: Props) {
  const navigate = useNavigate()
  const [year, setYear] = useState(initialYear || new Date().getFullYear())
  const [viewMode, setViewMode] = useState<ViewMode>('months')
  const [selectedType, setSelectedType] = useState<MilestoneType | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [milestoneToEdit, setMilestoneToEdit] = useState<Milestone | null>(null)

  const entries = useAllEntries()
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useMilestones(year)

  const today = useMemo(() => new Date(), [])

  // Map entries theo ngày
  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>()
    if (entries) {
      for (const e of entries) {
        map.set(e.date, e)
      }
    }
    return map
  }, [entries])

  // Lọc cột mốc theo type
  const filteredMilestones = useMemo(() => {
    if (selectedType === 'all') return milestones
    return milestones.filter((m) => m.type === selectedType)
  }, [milestones, selectedType])

  // Map cột mốc theo ngày
  const milestonesByDate = useMemo(() => {
    const map = new Map<string, Milestone[]>()
    for (const m of filteredMilestones) {
      const list = map.get(m.date) || []
      list.push(m)
      map.set(m.date, list)
    }
    return map
  }, [filteredMilestones])

  // Đóng bằng phím Esc và điều hướng bàn phím
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        if (isMilestoneModalOpen) {
          setIsMilestoneModalOpen(false)
        } else if (selectedDate) {
          setSelectedDate(null)
        } else {
          onClose()
        }
      }

      // Điều hướng bàn phím giữa các ô ngày
      if (selectedDate && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const curDate = fromKey(selectedDate)
        let delta = 0
        if (e.key === 'ArrowLeft') delta = -1
        if (e.key === 'ArrowRight') delta = 1
        if (e.key === 'ArrowUp') delta = -7
        if (e.key === 'ArrowDown') delta = 7

        const nextDate = new Date(curDate.getTime() + delta * 864e5)
        if (nextDate.getFullYear() === year) {
          setSelectedDate(toKey(nextDate))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isMilestoneModalOpen, selectedDate, year, onClose])

  // Khóa scroll body khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Tạo danh sách 12 tháng và các ngày trong năm
  const monthsData = useMemo(() => {
    const res = []
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate()
      const days = []
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, m, d)
        days.push(dateObj)
      }
      res.push({
        monthIndex: m,
        monthName: MONTH_SHORT[m],
        days,
      })
    }
    return res
  }, [year])

  // Tạo dữ liệu 52 tuần trong năm
  const weeksData = useMemo(() => {
    const jan1 = new Date(year, 0, 1)
    const days: Date[] = []
    for (
      let d = new Date(year, 0, 1);
      d.getFullYear() === year;
      d = new Date(year, d.getMonth(), d.getDate() + 1)
    ) {
      days.push(d)
    }

    const weeks: Date[][] = []
    let curWeek: Date[] = []

    // Padding ngày đầu năm cho đúng thứ trong tuần (Thứ 2 = 0)
    const startWeekday = (jan1.getDay() + 6) % 7
    for (let i = 0; i < startWeekday; i++) {
      curWeek.push(null as unknown as Date)
    }

    for (const d of days) {
      curWeek.push(d)
      if (curWeek.length === 7) {
        weeks.push(curWeek)
        curWeek = []
      }
    }
    if (curWeek.length > 0) {
      while (curWeek.length < 7) {
        curWeek.push(null as unknown as Date)
      }
      weeks.push(curWeek)
    }

    return weeks
  }, [year])

  // Thống kê số lượng
  const diaryDaysCount = useMemo(() => {
    if (!entries) return 0
    return entries.filter((e) => e.date.startsWith(`${year}-`)).length
  }, [entries, year])

  if (!isOpen) return null

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : null
  const selectedMilestones = selectedDate ? milestonesByDate.get(selectedDate) || [] : []

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Bản đồ cảm xúc và cột mốc năm ${year}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 md:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        layoutId="year-heatmap-container"
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-7xl flex-col rounded-none sm:rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:px-6 py-3 bg-[var(--surface-2)]">
          {/* Year Navigator & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
              <button
                type="button"
                aria-label="Năm trước"
                onClick={() => setYear((y) => y - 1)}
                className="flex size-7 items-center justify-center rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-bold text-sm sm:text-base text-[var(--text)] font-sans">
                {year}
              </span>
              <button
                type="button"
                aria-label="Năm sau"
                onClick={() => setYear((y) => y + 1)}
                className="flex size-7 items-center justify-center rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
                Bản đồ Cảm xúc & Cột mốc
                <span className="hidden sm:inline-flex rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                  Life in Weeks
                </span>
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {diaryDaysCount} ngày ghi nhật ký · {filteredMilestones.length} cột mốc trong năm
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('months')}
                className={`rounded-full px-2.5 py-1 transition-all ${
                  viewMode === 'months'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Theo Tháng
              </button>
              <button
                type="button"
                onClick={() => setViewMode('weeks')}
                className={`rounded-full px-2.5 py-1 transition-all ${
                  viewMode === 'weeks'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Theo Tuần
              </button>
            </div>

            {/* Add Milestone Button */}
            <button
              type="button"
              onClick={() => {
                setMilestoneToEdit(null)
                setIsMilestoneModalOpen(true)
              }}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus size={14} /> Thêm cột mốc
            </button>

            {/* Close Button */}
            <button
              type="button"
              aria-label="Đóng"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Milestone Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-2">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
            <Filter size={12} /> Lọc mốc:
          </span>
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'all'
                ? 'bg-[var(--text)] text-[var(--surface)] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Tất cả ({milestones.length})
          </button>
          {MILESTONE_TYPES.map((t) => {
            const count = milestones.filter((m) => m.type === t.type).length
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setSelectedType(t.type)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedType === t.type
                    ? 'border-2 border-[var(--border-strong)] shadow-xs font-bold'
                    : 'bg-[var(--surface-2)] opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedType === t.type ? t.bgColor : undefined,
                  color: t.color,
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Body Workspace: Grid + Day Detail Sidebar */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Main Heatmap Grid Scrollable Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {viewMode === 'months' ? (
              /* MONTHS VIEW: 12 rows, each row is a month */
              <div className="space-y-3 min-w-[720px]">
                {monthsData.map(({ monthIndex, monthName, days }) => (
                  <div key={monthIndex} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-right text-xs font-bold text-[var(--text-muted)]">
                      {monthName}
                    </span>
                    <div className="flex flex-1 flex-wrap items-center gap-1.5">
                      {days.map((d) => {
                        const dateStr = toKey(d)
                        const entry = entryMap.get(dateStr)
                        const dayMilestones = milestonesByDate.get(dateStr) || []
                        const isToday = isSameDay(d, today)
                        const isFuture = d > today
                        const isSelected = selectedDate === dateStr
                        const hasMilestones = dayMilestones.length > 0

                        return (
                          <div key={dateStr} className="relative group">
                            <button
                              type="button"
                              onClick={() => setSelectedDate(dateStr)}
                              aria-label={`${formatFullDate(d)}, ${
                                entry ? `mood ${MOOD_LABEL[entry.mood as Mood]}` : 'chưa có nhật ký'
                              }${
                                hasMilestones
                                  ? `, cột mốc: ${dayMilestones.map((m) => m.title).join(', ')}`
                                  : ''
                              }`}
                              className={`relative flex size-7 sm:size-8 items-center justify-center rounded-xl text-[11px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                                isToday ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)] font-bold' : ''
                              } ${
                                isSelected ? 'scale-110 shadow-md ring-2 ring-[var(--text)] z-10' : ''
                              } ${
                                isFuture ? 'opacity-40 hover:opacity-80' : 'hover:scale-105 hover:shadow-xs'
                              } ${
                                hasMilestones ? 'border-[1.5px] border-[var(--border-strong)]' : 'border border-[var(--border)]'
                              }`}
                              style={{
                                backgroundColor: entry
                                  ? moodColor(entry.mood)
                                  : 'var(--surface-2)',
                                color: entry ? '#2B2724' : 'var(--text-muted)',
                              }}
                            >
                              <span>{d.getDate()}</span>

                              {/* Dot indicator for milestones */}
                              {hasMilestones && (
                                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[var(--surface)] text-[9px] shadow-xs border border-[var(--border-strong)]">
                                  {dayMilestones[0].emoji}
                                </span>
                              )}
                            </button>

                            {/* Floating Milestone Pill Label on the Grid */}
                            {hasMilestones && (
                              <div
                                onClick={() => setSelectedDate(dateStr)}
                                className="absolute left-1/2 -bottom-6 -translate-x-1/2 z-20 hidden group-hover:flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text)] shadow-md whitespace-nowrap cursor-pointer pointer-events-auto transition-transform hover:scale-105"
                              >
                                <span>{dayMilestones[0].emoji}</span>
                                <span className="max-w-[120px] truncate">{dayMilestones[0].title}</span>
                                {dayMilestones.length > 1 && (
                                  <span className="text-[9px] font-mono rounded-full bg-[var(--surface-2)] px-1">
                                    +{dayMilestones.length - 1}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* WEEKS VIEW: 52 columns x 7 rows */
              <div className="space-y-2 min-w-[840px]">
                <div className="flex gap-1.5 pb-2">
                  <div className="w-8 shrink-0" />
                  {weeksData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5">
                      {week.map((d, di) => {
                        if (!d) {
                          return <div key={di} className="size-6 sm:size-7" />
                        }
                        const dateStr = toKey(d)
                        const entry = entryMap.get(dateStr)
                        const dayMilestones = milestonesByDate.get(dateStr) || []
                        const isToday = isSameDay(d, today)
                        const isFuture = d > today
                        const isSelected = selectedDate === dateStr
                        const hasMilestones = dayMilestones.length > 0

                        return (
                          <div key={dateStr} className="relative group">
                            <button
                              type="button"
                              onClick={() => setSelectedDate(dateStr)}
                              aria-label={`${formatFullDate(d)}`}
                              className={`relative flex size-6 sm:size-7 items-center justify-center rounded-lg text-[10px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                                isToday ? 'ring-2 ring-[var(--accent)] font-bold' : ''
                              } ${
                                isSelected ? 'scale-110 shadow-md ring-2 ring-[var(--text)] z-10' : ''
                              } ${
                                isFuture ? 'opacity-35' : 'hover:scale-110 hover:shadow-xs'
                              } ${
                                hasMilestones ? 'border border-[var(--border-strong)]' : 'border border-[var(--border)]'
                              }`}
                              style={{
                                backgroundColor: entry
                                  ? moodColor(entry.mood)
                                  : 'var(--surface-2)',
                                color: entry ? '#2B2724' : 'var(--text-muted)',
                              }}
                            >
                              {hasMilestones ? (
                                <span className="text-[10px]">{dayMilestones[0].emoji}</span>
                              ) : (
                                <span>{d.getDate()}</span>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Day Details & Milestones Inspector */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full sm:w-80 md:w-96 shrink-0 border-l border-[var(--border)] bg-[var(--surface-2)] p-5 overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">
                      {formatFullDate(fromKey(selectedDate))}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">Chi tiết tâm trạng & cột mốc</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="flex size-7 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Day Mood & Stats Summary */}
                <div className="mt-4 space-y-4">
                  {selectedEntry ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-10 items-center justify-center rounded-2xl text-xl shadow-xs"
                          style={{ backgroundColor: moodColor(selectedEntry.mood) }}
                        >
                          {selectedEntry.mood === 5 && '😄'}
                          {selectedEntry.mood === 4 && '🙂'}
                          {selectedEntry.mood === 3 && '😐'}
                          {selectedEntry.mood === 2 && '🙁'}
                          {selectedEntry.mood === 1 && '😢'}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">
                            Tâm trạng: {MOOD_LABEL[selectedEntry.mood as Mood]}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                            {selectedEntry.energy && (
                              <span className="flex items-center gap-1">
                                <Zap size={11} className="text-amber-500" /> Năng lượng: {selectedEntry.energy}/5
                              </span>
                            )}
                            {selectedEntry.sleepHours && (
                              <span className="flex items-center gap-1">
                                <Moon size={11} className="text-indigo-400" /> Ngủ: {selectedEntry.sleepHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedEntry.tags.map((t: string) => (
                            <span
                              key={t}
                              className="rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Content Preview */}
                      {selectedEntry.content && (
                        <p className="text-xs text-[var(--text-muted)] italic leading-relaxed line-clamp-4 pt-1 border-t border-[var(--border)]">
                          “{selectedEntry.content}”
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          navigate(`/lich?ngay=${selectedDate}`)
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-1.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] transition-all"
                      >
                        <BookOpen size={13} /> Mở trang nhật ký ngày này
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-center space-y-2 bg-[var(--surface)]">
                      <p className="text-xs text-[var(--text-muted)]">Chưa có bài viết nhật ký trong ngày này</p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          navigate(`/lich?ngay=${selectedDate}`)
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--accent)] px-3 py-1 text-xs font-bold text-[var(--accent-contrast)] shadow-xs transition-all"
                      >
                        <Plus size={12} /> Viết nhật ký ngay
                      </button>
                    </div>
                  )}

                  {/* Milestones in this Day */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[var(--accent)]" /> Cột mốc ({selectedMilestones.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setMilestoneToEdit(null)
                          setIsMilestoneModalOpen(true)
                        }}
                        className="text-[11px] font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
                      >
                        <Plus size={12} /> Thêm mốc
                      </button>
                    </div>

                    {selectedMilestones.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic">
                        Chưa có cột mốc nào trong ngày này.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedMilestones.map((m) => {
                          const typeInfo = MILESTONE_TYPES.find((t) => t.type === m.type)
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setMilestoneToEdit(m)
                                setIsMilestoneModalOpen(true)
                              }}
                              className="group flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-xs"
                            >
                              <span className="text-xl shrink-0">{m.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-[var(--text)] truncate">{m.title}</p>
                                  {m.repeatYearly && (
                                    <span className="text-[9px] rounded-full bg-[var(--surface-2)] px-1.5 py-0.2 text-[var(--text-muted)] shrink-0">
                                      Lặp hằng năm
                                    </span>
                                  )}
                                </div>
                                {m.note && (
                                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                                    {m.note}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5">
                                  {typeInfo && (
                                    <span
                                      className="rounded-full px-2 py-0.2 text-[10px] font-semibold"
                                      style={{
                                        backgroundColor: typeInfo.bgColor,
                                        color: typeInfo.color,
                                      }}
                                    >
                                      {typeInfo.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Bar: Legend & Statistics */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 sm:px-6 py-2.5 bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>Tâm trạng:</span>
            <div className="flex items-center gap-1.5">
              <span>Rất tệ</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((m) => (
                  <span
                    key={m}
                    className="size-3.5 rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: moodColor(m as Mood) }}
                  />
                ))}
              </div>
              <span>Rất tốt</span>
              <span className="ml-2 flex items-center gap-1">
                <span className="size-3.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)]" />
                Ô trống
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span>Phím tắt: <strong>Mũi tên</strong> di chuyển · <strong>Enter</strong> xem ngày · <strong>Esc</strong> đóng</span>
          </div>
        </footer>
      </motion.div>

      {/* Modal Thêm / Chỉnh sửa Cột mốc */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false)
          setMilestoneToEdit(null)
        }}
        initialDate={selectedDate || `${year}-01-01`}
        milestoneToEdit={milestoneToEdit}
        onSave={async (data) => {
          if (milestoneToEdit) {
            await updateMilestone(milestoneToEdit.id, data)
          } else {
            await addMilestone(data)
          }
        }}
        onDelete={async (id) => {
          await deleteMilestone(id)
        }}
      />
    </div>
  )
}
