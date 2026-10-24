import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Filter, RotateCcw, Search } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { ROUTES } from '@/constants/app'
import { EMOTION_TAGS } from '@/constants/entry'
import type { Entry } from '@/db/db'
import { useAllEntries } from '@/db/useEntries'
import { fromKey } from '@/lib/date'
import { MOOD_LABEL, MOODS, moodColor, type Mood } from '@/lib/mood'
import { playPopSound } from '@/lib/sound'
import {
  DoodleMood1,
  DoodleMood2,
  DoodleMood3,
  DoodleMood4,
  DoodleMood5,
  DoodleFlower,
} from '@/components/DoodleIcons'

const dayFmt = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

function renderMoodDoodle(m: Mood) {
  switch (m) {
    case 1:
      return <DoodleMood1 size={36} />
    case 2:
      return <DoodleMood2 size={36} />
    case 3:
      return <DoodleMood3 size={36} />
    case 4:
      return <DoodleMood4 size={36} />
    case 5:
      return <DoodleMood5 size={36} />
  }
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      to={`${ROUTES.calendar}?ngay=${entry.date}`}
      id={`journal-${entry.date}`}
      onClick={playPopSound}
      className="group relative flex gap-4 rounded-3xl border-[1.5px] border-[#2B2724]/20 bg-[#FBFAF7] p-5 shadow-[2px_3px_0px_rgba(43,39,36,0.06)] transition-all hover:-translate-y-1 hover:shadow-[3px_4px_0px_#2B2724] dark:border-white/20 dark:bg-[#282421]"
    >
      {/* Khuôn mặt vẽ tay tương ứng với mood */}
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-[#2B2724]/20 p-1 shadow-sm transition-transform group-hover:scale-105"
        style={{ background: moodColor(entry.mood) }}
        title={MOOD_LABEL[entry.mood]}
      >
        {renderMoodDoodle(entry.mood)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="font-serif text-base font-semibold italic text-[#2B2724] dark:text-[#EDE8E3] capitalize">
            {dayFmt.format(fromKey(entry.date))}
          </p>
          <span className="font-sans text-xs text-[#7A736B] dark:text-[#A8A199]">{MOOD_LABEL[entry.mood]}</span>
        </div>

        {entry.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#2B2724]/20 bg-[#FBFAF7] px-2.5 py-0.5 text-[11px] font-sans text-[#7A736B] dark:border-white/20 dark:bg-white/5 dark:text-[#A8A199]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="mt-2.5 line-clamp-2 font-sans text-sm text-[#2B2724]/80 dark:text-[#EDE8E3]/80 leading-relaxed">
          {entry.content || <span className="font-serif italic text-[#7A736B]/60">Không có ghi chú thêm ✿</span>}
        </p>
      </div>
    </Link>
  )
}

export default function JournalPage() {
  const entries = useAllEntries()
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!entries) return <PageHeader title="Nhật ký" />

  const q = query.trim().toLowerCase()
  const filtered = entries
    .filter((e) => (moodFilter ? e.mood === moodFilter : true))
    .filter((e) => (selectedTag ? e.tags.includes(selectedTag) : true))
    .filter((e) => (startDate ? e.date >= startDate : true))
    .filter((e) => (endDate ? e.date <= endDate : true))
    .filter(
      (e) =>
        !q ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.date.includes(q),
    )
    .reverse()

  const hasFilter = Boolean(query || moodFilter || selectedTag || startDate || endDate)

  const resetFilters = () => {
    playPopSound()
    setQuery('')
    setMoodFilter(null)
    setSelectedTag(null)
    setStartDate('')
    setEndDate('')
  }

  const groups = new Map<string, Entry[]>()
  filtered.forEach((e) => {
    const k = e.date.slice(0, 7)
    groups.set(k, [...(groups.get(k) ?? []), e])
  })

  const availableTags = Array.from(
    new Set([...EMOTION_TAGS, ...entries.flatMap((e) => e.tags)]),
  ).filter((t) => entries.some((e) => e.tags.includes(t)))

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Trang sổ kỷ niệm"
        subtitle={`${entries.length} ngày đã viết lại ✿${hasFilter ? ` · đang xem ${filtered.length} trang` : ''}`}
      />

      {/* Thanh tìm kiếm & bộ lọc */}
      <div className="relative rounded-3xl border-[1.5px] border-[#2B2724]/20 bg-[#FBFAF7] p-5 shadow-[2px_3px_0px_rgba(43,39,36,0.06)] dark:border-white/20 dark:bg-[#282421] space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Tìm kiếm trang nhật ký</span>
            <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7A736B]" />
            <input
              id="journal-search"
              type="search"
              placeholder="Tìm theo cảm xúc, từ khóa, hoặc ngày (YYYY-MM-DD)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border-[1.5px] border-[#2B2724]/20 bg-[#FBFAF7] py-2 pr-4 pl-10 text-sm font-sans text-[#2B2724] outline-none transition-all placeholder:text-[#7A736B]/60 focus:border-[#2B2724] focus:shadow-[1.5px_2px_0px_#2B2724] dark:border-white/20 dark:bg-transparent dark:text-[#EDE8E3]"
            />
          </label>

          <div className="flex items-center gap-2">
            {/* 5 Nút lọc theo Mood */}
            <div className="flex gap-1.5" role="group" aria-label="Lọc theo tâm trạng">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={moodFilter === m}
                  aria-label={MOOD_LABEL[m]}
                  title={MOOD_LABEL[m]}
                  onClick={() => {
                    playPopSound()
                    setMoodFilter(moodFilter === m ? null : m)
                  }}
                  className={`flex size-8 items-center justify-center rounded-full border-[1.5px] transition-all hover:-translate-y-0.5 ${
                    moodFilter === m
                      ? 'border-[#2B2724] shadow-[1.5px_2px_0px_#2B2724] scale-105'
                      : 'border-[#2B2724]/20 opacity-60 hover:opacity-100'
                  }`}
                  style={{ background: moodColor(m) }}
                >
                  <span className="text-xs">✿</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playPopSound()
                setShowAdvanced(!showAdvanced)
              }}
              title="Bộ lọc ngày"
              className={`flex size-8 items-center justify-center rounded-full border-[1.5px] transition-all ${
                showAdvanced || startDate || endDate
                  ? 'border-[#2B2724] bg-[#F6E3A8] text-[#2B2724] shadow-[1.5px_2px_0px_#2B2724]'
                  : 'border-[#2B2724]/20 text-[#7A736B] hover:border-[#2B2724]'
              }`}
            >
              <Filter size={14} />
            </button>

            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                title="Xóa bộ lọc"
                className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-[#2B2724]/20 text-[#7A736B] hover:border-[#2B2724] hover:text-[#2B2724]"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Thẻ cảm xúc để lọc nhanh */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#2B2724]/10 dark:border-white/10">
            <span className="font-mono text-[10px] tracking-widest text-[#7A736B] uppercase mr-1">
              TAGS:
            </span>
            {availableTags.map((t) => {
              const on = selectedTag === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    playPopSound()
                    setSelectedTag(on ? null : t)
                  }}
                  className={`rounded-full border-[1.5px] px-3 py-0.5 text-xs font-sans transition-all hover:-translate-y-0.5 ${
                    on
                      ? 'border-[#2B2724] bg-[#CFE3DD] text-[#2B2724] font-medium shadow-[1.5px_2px_0px_#2B2724]'
                      : 'border-[#2B2724]/20 bg-[#FBFAF7] text-[#7A736B] hover:border-[#2B2724] dark:border-white/20 dark:bg-transparent dark:text-[#A8A199]'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Danh sách các trang nhật ký */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={hasFilter ? 'Không tìm thấy trang phù hợp' : 'Chưa có trang nhật ký nào'}
          description={
            hasFilter
              ? 'Thử xóa bớt bộ lọc hoặc tìm từ khóa khác xem sao nha ✿'
              : 'Hãy bắt đầu viết lại ngày hôm nay của bạn từ trang chủ nhé.'
          }
          actionLabel={hasFilter ? 'Viết trang hôm nay ✿' : 'Viết trang đầu tiên ✿'}
          actionTo={ROUTES.today}
        />
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([monthKey, monthEntries]) => {
            const [y, m] = monthKey.split('-').map(Number)
            const label = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
              new Date(y, m - 1, 1),
            )
            return (
              <section key={monthKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <DoodleFlower size={14} className="text-[#F4C6D0]" />
                  <h3 className="font-serif text-lg italic text-[#2B2724] dark:text-[#EDE8E3] capitalize">
                    {label}
                  </h3>
                  <span className="font-mono text-[10px] text-[#7A736B] dark:text-[#A8A199]">
                    ({monthEntries.length} trang)
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {monthEntries.map((e) => (
                    <EntryCard key={e.date} entry={e} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
