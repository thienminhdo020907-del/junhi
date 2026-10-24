import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Clock, CloudCheck, Sparkles } from 'lucide-react'
import SleepClock from '@/components/SleepClock'
import type { Energy, Entry } from '@/db/db'
import { saveEntry } from '@/db/saveEntry'
import { getStoredToken, syncUpload } from '@/lib/api'
import { EMOTION_TAGS, ENERGY_LABEL } from '@/constants/entry'
import { MOOD_EMOJI, MOOD_LABEL, MOODS, moodColor, type Mood } from '@/lib/mood'

const ENERGIES: Energy[] = [1, 2, 3, 4, 5]
const labelCls = 'mb-2.5 block text-sm font-semibold'

export default function TodayForm({ date, entry }: { date: string; entry?: Entry }) {
  const [mood, setMood] = useState<Mood | null>(entry?.mood ?? null)
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [energy, setEnergy] = useState<Energy | null>(entry?.energy ?? null)
  const [sleep, setSleep] = useState(entry?.sleepHours != null ? String(entry.sleepHours) : '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)

  const isInitialMount = useRef(true)
  const debounceTimer = useRef<number | null>(null)

  const markDirty = () => {
    setStatus('idle')
  }

  const toggleTag = (t: string) => {
    markDirty()
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

  const performSave = useCallback(
    async (
      currentMood: Mood | null,
      currentTags: string[],
      currentEnergy: Energy | null,
      currentSleep: string,
      currentContent: string,
    ) => {
      if (!currentMood) return
      setStatus('saving')
      const hours = currentSleep === '' ? null : Math.min(24, Math.max(0, Number(currentSleep)))
      await saveEntry({
        date,
        mood: currentMood,
        tags: currentTags,
        energy: currentEnergy,
        sleepHours: hours !== null && Number.isFinite(hours) ? hours : null,
        content: currentContent.trim(),
      })
      setStatus('saved')
      setLastSavedTime(
        new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      )

      // Nếu đã đăng nhập, tự động đồng bộ ngầm lên MySQL
      if (getStoredToken()) {
        syncUpload([
          {
            date,
            mood: currentMood,
            energy: currentEnergy ?? 3,
            sleepHours: hours !== null && Number.isFinite(hours) ? hours : 8,
            tags: currentTags,
            content: currentContent.trim(),
          },
        ]).catch(() => {})
      }
    },
    [date],
  )

  // Tự động lưu sau khi ngừng nhập 1 giây (nếu đã chọn mood)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!mood) return

    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = window.setTimeout(() => {
      void performSave(mood, tags, energy, sleep, content)
    }, 1000)

    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current)
      }
    }
  }, [mood, tags, energy, sleep, content, performSave])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current)
    }
    await performSave(mood, tags, energy, sleep, content)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Cột trái: Mood + Cảm xúc + Sức khỏe */}
      <div className="space-y-6">
        <section className="card">
          <p className={labelCls}>Hôm nay bạn cảm thấy thế nào?</p>
          <div className="grid grid-cols-5 gap-2.5" role="radiogroup" aria-label="Tâm trạng">
            {MOODS.map((m) => {
              const selected = mood === m
              return (
                <button
                  key={m}
                  type="button"
                  id={`mood-${m}`}
                  role="radio"
                  aria-checked={selected}
                  aria-label={MOOD_LABEL[m]}
                  onClick={() => {
                    markDirty()
                    setMood(m)
                  }}
                  className={`flex aspect-square items-center justify-center rounded-2xl text-3xl transition-all active:scale-90 ${
                    selected
                      ? 'scale-110 shadow-md ring-2 ring-brand-500'
                      : 'opacity-60 grayscale-[40%] hover:opacity-90'
                  }`}
                  style={{ background: selected ? moodColor(m) : 'var(--empty-cell)' }}
                >
                  {MOOD_EMOJI[m]}
                </button>
              )
            })}
          </div>
          <p className="mt-3.5 h-5 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
            {mood ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-500" />
                {MOOD_LABEL[mood]}
              </span>
            ) : (
              'Chọn một biểu tượng để bắt đầu ghi'
            )}
          </p>
        </section>

        <section className="card">
          <p className={labelCls}>Cảm xúc nổi bật</p>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((t) => {
              const on = tags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(t)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    on
                      ? 'bg-brand-500 text-white shadow-sm ring-1 ring-brand-600'
                      : 'bg-brand-100/70 text-slate-600 hover:bg-brand-100 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </section>

        {/* Khung Mức năng lượng với hiệu ứng animation: 1-2 đóng băng, 3 safe & heal, 4-5 cháy lửa */}
        <section
          className={`card transition-all duration-500 ${
            energy === 1 || energy === 2
              ? 'energy-freeze'
              : energy === 3
                ? 'energy-heal'
                : energy === 4 || energy === 5
                  ? 'energy-fire'
                  : ''
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <span>Mức năng lượng</span>
              {(energy === 1 || energy === 2) && (
                <span
                  className="inline-block animate-spin text-base text-sky-400"
                  style={{ animationDuration: '6s' }}
                  title="Đóng băng"
                >
                  ❄️
                </span>
              )}
              {energy === 3 && (
                <span className="inline-block animate-pulse text-base text-emerald-500" title="Safe & Heal">
                  🌿
                </span>
              )}
              {(energy === 4 || energy === 5) && (
                <span className="inline-block animate-bounce text-base text-orange-500" title="Cháy rực lửa">
                  🔥
                </span>
              )}
            </p>
            {energy && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  energy === 1 || energy === 2
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                    : energy === 3
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                }`}
              >
                {energy === 1 || energy === 2
                  ? 'Đóng băng'
                  : energy === 3
                    ? 'Safe & Heal'
                    : 'Bùng cháy'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Năng lượng">
            {ENERGIES.map((n) => {
              const isSelected = energy === n
              let activeTheme = 'bg-brand-500 text-white'
              if (isSelected) {
                if (n === 1 || n === 2) {
                  activeTheme =
                    'bg-gradient-to-br from-sky-400 to-cyan-600 text-white shadow-md shadow-sky-500/35 ring-2 ring-sky-300'
                } else if (n === 3) {
                  activeTheme =
                    'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/35 ring-2 ring-emerald-300'
                } else if (n === 4 || n === 5) {
                  activeTheme =
                    'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white shadow-md shadow-orange-500/45 ring-2 ring-amber-300'
                }
              }

              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    markDirty()
                    setEnergy(n)
                  }}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                    isSelected
                      ? `${activeTheme} scale-105`
                      : 'bg-brand-100/70 text-slate-600 hover:bg-brand-100 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>

          <p className="mt-2.5 h-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {energy ? `Năng lượng: ${ENERGY_LABEL[energy]}` : 'Chọn mức năng lượng hôm nay'}
          </p>
        </section>

        {/* Đồng hồ tròn 24 giờ SVG theo dõi giấc ngủ */}
        <SleepClock
          value={sleep !== '' ? Number(sleep) : null}
          onChange={(hours) => {
            markDirty()
            setSleep(String(hours))
          }}
        />
      </div>

      {/* Cột phải: Khung editor viết nhật ký rộng rãi */}
      <div className="space-y-4">
        <section className="card flex min-h-[380px] flex-col">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="content" className="text-sm font-semibold">
              Nhật ký hôm nay
            </label>
            <div className="text-xs text-slate-400">
              {wordCount} từ · {charCount} ký tự
            </div>
          </div>

          <textarea
            id="content"
            rows={12}
            placeholder="Kể về ngày hôm nay của bạn... Những việc đã làm, người bạn đã gặp, hoặc suy nghĩ lúc này?"
            value={content}
            onChange={(e) => {
              markDirty()
              setContent(e.target.value)
            }}
            className="w-full flex-1 resize-y rounded-2xl border border-brand-100/80 bg-white/50 p-4 text-[15px] leading-relaxed outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5"
          />

          {/* Thanh trạng thái tự động lưu */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              {status === 'saving' && (
                <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300">
                  <span className="inline-block size-2 animate-pulse rounded-full bg-brand-500" />
                  Đang tự động lưu...
                </span>
              )}
              {status === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CloudCheck size={14} />
                  Đã tự động lưu {lastSavedTime ? `lúc ${lastSavedTime}` : ''}
                </span>
              )}
              {status === 'idle' && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock size={13} />
                  Tự động lưu sau 1s ngừng gõ
                </span>
              )}
            </div>

            {!mood && <span className="text-amber-500">Hãy chọn tâm trạng để kích hoạt lưu</span>}
          </div>
        </section>

        {/* Nút lưu thủ công */}
        <button
          id="save-entry"
          type="submit"
          disabled={!mood || status === 'saving'}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-brand-600 active:scale-[0.98] disabled:opacity-40"
        >
          {status === 'saved' ? (
            <>
              <Check size={20} /> Đã lưu thành công
            </>
          ) : entry ? (
            'Cập nhật ngay'
          ) : (
            'Lưu nhật ký'
          )}
        </button>
      </div>
    </form>
  )
}
