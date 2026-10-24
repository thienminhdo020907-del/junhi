import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Calendar, Filter, RotateCcw, Search, Tag as TagIcon } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { ROUTES } from '@/constants/app'
import { EMOTION_TAGS } from '@/constants/entry'
import type { Entry } from '@/db/db'
import { useAllEntries } from '@/db/useEntries'
import { fromKey } from '@/lib/date'
import { MOOD_EMOJI, MOOD_LABEL, MOODS, moodColor, type Mood } from '@/lib/mood'

const dayFmt = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      to={`${ROUTES.calendar}?ngay=${entry.date}`}
      id={`journal-${entry.date}`}
      className="card flex gap-4 !p-4.5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-xs"
        style={{ background: moodColor(entry.mood) }}
        title={MOOD_LABEL[entry.mood]}
      >
        {MOOD_EMOJI[entry.mood]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold capitalize">{dayFmt.format(fromKey(entry.date))}</p>
          <span className="text-xs text-slate-400">{MOOD_LABEL[entry.mood]}</span>
        </div>
        {entry.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-100/70 px-2 py-0.5 text-[11px] text-brand-700 dark:bg-white/10 dark:text-brand-100"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {entry.content || <span className="italic text-slate-400">Không có ghi chú.</span>}
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
    setQuery('')
    setMoodFilter(null)
    setSelectedTag(null)
    setStartDate('')
    setEndDate('')
  }

  // Gom theo tháng, mới nhất trước
  const groups = new Map<string, Entry[]>()
  filtered.forEach((e) => {
    const k = e.date.slice(0, 7)
    groups.set(k, [...(groups.get(k) ?? []), e])
  })

  // Tìm tất cả các tag đã từng được dùng
  const availableTags = Array.from(
    new Set([...EMOTION_TAGS, ...entries.flatMap((e) => e.tags)]),
  ).filter((t) => entries.some((e) => e.tags.includes(t)))

  return (
    <>
      <PageHeader
        title="Nhật ký"
        subtitle={`${entries.length} ngày đã ghi chép${hasFilter ? ` · hiển thị ${filtered.length} kết quả` : ''}`}
      />

      {/* Thanh tìm kiếm & bộ lọc */}
      <div className="card mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Tìm kiếm nhật ký</span>
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              id="journal-search"
              type="search"
              placeholder="Tìm theo nội dung, tag, hoặc ngày (YYYY-MM-DD)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-brand-100 bg-white/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5"
            />
          </label>

          <div className="flex items-center gap-2">
            {/* Lọc theo Mood */}
            <div className="flex gap-1.5" role="group" aria-label="Lọc theo tâm trạng">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={moodFilter === m}
                  aria-label={MOOD_LABEL[m]}
                  title={MOOD_LABEL[m]}
                  onClick={() => setMoodFilter(moodFilter === m ? null : m)}
                  className={`flex size-9 items-center justify-center rounded-xl text-lg transition-all ${
                    moodFilter === m ? 'scale-105 ring-2 ring-brand-500 shadow-xs' : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{ background: moodFilter === m ? moodColor(m) : 'var(--empty-cell)' }}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                showAdvanced || selectedTag || startDate || endDate
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-100'
                  : 'border-brand-100 text-slate-600 hover:bg-black/5 dark:border-white/10 dark:text-slate-300'
              }`}
            >
              <Filter size={14} />
              Lọc thêm
            </button>

            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                title="Đặt lại bộ lọc"
                className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Bảng bộ lọc mở rộng: Lọc theo Tag và Khoảng ngày */}
        {showAdvanced && (
          <div className="grid gap-4 border-t border-brand-100/70 pt-3 dark:border-white/10 sm:grid-cols-2">
            {/* Khoảng ngày */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Calendar size={13} className="text-brand-500" />
                Khoảng ngày
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-brand-100 bg-transparent px-2.5 py-1.5 text-xs dark:border-white/20"
                />
                <span className="text-xs text-slate-400">đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-brand-100 bg-transparent px-2.5 py-1.5 text-xs dark:border-white/20"
                />
              </div>
            </div>

            {/* Tag cảm xúc */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <TagIcon size={13} className="text-brand-500" />
                Tag cảm xúc
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.length === 0 ? (
                  <span className="text-xs text-slate-400">Chưa có tag nào trong dữ liệu.</span>
                ) : (
                  availableTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTag((cur) => (cur === t ? null : t))}
                      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                        selectedTag === t
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-brand-100/60 text-slate-600 hover:bg-brand-100 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa có trang nhật ký nào"
          description="Mỗi ngày là một câu chuyện đáng để ghi lại. Hãy bắt đầu ghi chép cảm xúc và năng lượng của bạn ngay hôm nay nhé!"
          actionLabel="Bắt đầu trang nhật ký đầu tiên"
          actionTo={ROUTES.today}
          secondaryLabel="Cài đặt & Nhập sao lưu"
          secondaryTo={ROUTES.settings}
        />
      ) : filtered.length === 0 ? (
        <div className="card py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="text-3xl">🔍</p>
          <p className="mt-2 font-medium">Không tìm thấy bài nào phù hợp với bộ lọc.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs text-brand-600 underline dark:text-brand-300"
          >
            Xóa bộ lọc để xem tất cả
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {[...groups].map(([key, list]) => (
            <section key={key} aria-label={`Tháng ${key}`}>
              <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Tháng {Number(key.slice(5))}/{key.slice(0, 4)} ({list.length} bài)
              </h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {list.map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
