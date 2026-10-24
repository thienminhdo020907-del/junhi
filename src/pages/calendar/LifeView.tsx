import { useState } from 'react'
import { useBirthDate } from '@/db/useBirthDate'
import { useEntriesInRange } from '@/db/useEntries'
import { addDays, fromKey, toKey } from '@/lib/date'
import { moodColor, type Mood } from '@/lib/mood'

const YEARS = 90
const WEEKS_PER_ROW = 52

interface Props {
  onOpenWeek: (d: Date) => void
}

const daysBetween = (a: Date, b: Date) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      864e5,
  )

export default function LifeView({ onOpenWeek }: Props) {
  const { loading, birthDate, setBirthDate } = useBirthDate()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [today] = useState(() => new Date())

  const birth = birthDate ? fromKey(birthDate) : null
  const entries = useEntriesInRange(birth ? toKey(birth) : '9999-01-01', toKey(today))

  if (loading) return null

  if (!birth || editing) {
    return (
      <form
        className="card space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!draft) return
          await setBirthDate(draft)
          setEditing(false)
        }}
      >
        <p className="text-sm">
          Nhập ngày sinh để xem bản đồ cuộc đời: mỗi ô là một tuần bạn đã sống.
        </p>
        <label className="block text-sm font-medium" htmlFor="birth-input">
          Ngày sinh
        </label>
        <input
          id="birth-input"
          type="date"
          required
          max={toKey(today)}
          min="1900-01-01"
          value={draft || birthDate || ''}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-xl border border-brand-100 bg-transparent px-3 py-2 dark:border-white/20"
        />
        <div className="flex gap-2">
          <button
            id="birth-save"
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white active:scale-95"
          >
            Lưu
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl px-4 py-2 text-sm text-slate-500"
            >
              Huỷ
            </button>
          )}
        </div>
      </form>
    )
  }

  // Gom mood theo tuần kể từ ngày sinh: chỉ số tuần -> [tổng, số lượng]
  const sums = new Map<number, [number, number]>()
  entries?.forEach((e) => {
    const w = Math.floor(daysBetween(birth, fromKey(e.date)) / 7)
    const cur = sums.get(w) ?? [0, 0]
    sums.set(w, [cur[0] + e.mood, cur[1] + 1])
  })

  const currentWeek = Math.floor(daysBetween(birth, today) / 7)
  const total = YEARS * WEEKS_PER_ROW

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Đã sống {currentWeek.toLocaleString('vi-VN')} / {total.toLocaleString('vi-VN')} tuần
        </span>
        <button
          id="birth-edit"
          type="button"
          onClick={() => {
            setDraft(birthDate ?? '')
            setEditing(true)
          }}
          className="underline"
        >
          Đổi ngày sinh
        </button>
      </div>

      <div className="space-y-[2px]">
        {Array.from({ length: YEARS }, (_, y) => (
          <div key={y} className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-right text-[8px] leading-none text-slate-500 dark:text-slate-400">
              {y % 10 === 0 ? y : ''}
            </span>
            <div
              className="grid flex-1 gap-[1.5px]"
              style={{ gridTemplateColumns: `repeat(${WEEKS_PER_ROW}, 1fr)` }}
            >
              {Array.from({ length: WEEKS_PER_ROW }, (_, w) => {
                const idx = y * WEEKS_PER_ROW + w
                const s = sums.get(idx)
                const past = idx <= currentWeek
                const mood = s ? (Math.round(s[0] / s[1]) as Mood) : null
                return (
                  <button
                    key={w}
                    type="button"
                    aria-label={`Tuổi ${y}, tuần ${w + 1}`}
                    disabled={!past}
                    onClick={() => onOpenWeek(addDays(birth, idx * 7))}
                    className={`aspect-square rounded-[1.5px] ${
                      idx === currentWeek ? 'ring-1 ring-brand-500' : ''
                    } ${!past ? 'border border-slate-300/60 dark:border-white/10' : ''}`}
                    style={{
                      background: mood
                        ? moodColor(mood)
                        : past
                          ? 'var(--empty-cell)'
                          : 'transparent',
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
