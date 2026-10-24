import { useState } from 'react'
import {
  Sparkles,
  CalendarHeart,
  TrendingUp,
} from 'lucide-react'
import {
  DoodleMood1,
  DoodleMood2,
  DoodleMood3,
  DoodleMood4,
  DoodleMood5,
  DoodleFlower,
} from '@/components/DoodleIcons'

const MOODS = [1, 2, 3, 4, 5] as const
const SAMPLE_TAGS = ['Bình yên', 'Biết ơn', 'Vui vẻ', 'Mệt mỏi']

export default function ThemePreviewPanel() {
  const [selectedMood, setSelectedMood] = useState<number>(4)
  const [selectedTags, setSelectedTags] = useState<string[]>(['Bình yên', 'Biết ơn'])
  const [selectedEnergy, setSelectedEnergy] = useState<number>(4)
  const [sampleJournal, setSampleJournal] = useState(
    'Một buổi chiều dịu êm bên tách trà hoa cúc và vài trang sách nhỏ...',
  )

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  const renderDoodleMood = (m: number) => {
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
      default:
        return null
    }
  }

  return (
    <div className="space-y-5 p-2 sm:p-4 max-w-xl mx-auto">
      {/* 1. Thẻ Mood 5 mặt cười vẽ tay */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif italic text-base text-[var(--text)]">
            Hôm nay tâm trạng bạn thế nào? ✿
          </h4>
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
            MOOD 1—5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMood(m)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all p-1 ${
                  isSelected
                    ? 'border-[var(--border-strong)] scale-105 shadow-md'
                    : 'border-[var(--border)] opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{
                  backgroundColor: isSelected ? `var(--mood-${m})` : 'var(--surface)',
                }}
              >
                {renderDoodleMood(m)}
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. Chip Tags & Mức năng lượng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="card space-y-2.5">
          <h4 className="font-serif italic text-sm text-[var(--text)]">Cảm xúc nổi bật 🍃</h4>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TAGS.map((t) => {
              const on = selectedTags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-sans transition-all ${
                    on
                      ? 'border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-contrast)] font-medium shadow-xs'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </section>

        <section className="card space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif italic text-sm text-[var(--text)]">Mức năng lượng ⚡</h4>
            <span className="text-[11px] text-[var(--text-muted)]">Mức {selectedEnergy}/5</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const on = selectedEnergy === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedEnergy(n)}
                  className={`rounded-xl border py-1.5 font-mono text-xs font-bold transition-all ${
                    on
                      ? 'border-[var(--border-strong)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs scale-105'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* 3. Ô nhật ký có dòng kẻ paper-lined */}
      <section className="card space-y-2">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <div className="flex items-center gap-1.5">
            <DoodleFlower size={16} className="text-[var(--accent)]" />
            <h4 className="font-serif italic text-sm text-[var(--text)]">Trang nhật ký hôm nay</h4>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">12 TỪ</span>
        </div>
        <textarea
          rows={3}
          value={sampleJournal}
          onChange={(e) => setSampleJournal(e.target.value)}
          placeholder="Viết vài dòng cảm xúc nhẹ nhàng..."
          className="paper-lined w-full resize-none rounded-xl border-none p-2.5 font-sans text-xs sm:text-sm text-[var(--text)] outline-none"
        />
      </section>

      {/* 4. Hai nút: Nút chính & Nút phụ */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex-1 rounded-full bg-[var(--accent)] py-2.5 px-4 text-xs sm:text-sm font-semibold text-[var(--accent-contrast)] shadow-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 border border-[var(--border-strong)]"
        >
          <Sparkles size={14} /> Lưu trang hôm nay ✿
        </button>
        <button
          type="button"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 px-4 text-xs sm:text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-98 transition-all"
        >
          Xem lại
        </button>
      </div>

      {/* 5. Lịch tháng nhỏ tô màu mood & Mini chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mini Calendar Month */}
        <section className="card space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
            <span>Tháng 10</span>
            <CalendarHeart size={14} className="text-[var(--accent)]" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-[var(--text-muted)]">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => {
              const hasMood = (i * 7) % 5 + 1
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-[var(--border)] flex items-center justify-center font-mono text-[8px]"
                  style={{
                    backgroundColor: i % 2 === 0 ? `var(--mood-${hasMood})` : 'transparent',
                    color: i % 2 === 0 ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  {i + 1}
                </div>
              )
            })}
          </div>
        </section>

        {/* Mini Chart */}
        <section className="card space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text)]">
            <span>Xu hướng tâm trạng</span>
            <TrendingUp size={14} className="text-[var(--accent)]" />
          </div>
          <div className="h-28 w-full pt-2 flex items-end justify-between gap-1.5">
            {[3.2, 4.0, 2.5, 4.8, 3.8, 4.5, 5.0].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(val / 5) * 80}px`,
                    backgroundColor: `var(--chart-${(i % 5) + 1})`,
                  }}
                />
                <span className="font-mono text-[8px] text-[var(--text-muted)]">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
