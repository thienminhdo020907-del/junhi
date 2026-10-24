import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Clock, CloudCheck, Sparkles } from 'lucide-react'
import SleepClock from '@/components/SleepClock'
import type { Energy, Entry } from '@/db/db'
import { saveEntry } from '@/db/saveEntry'
import { getStoredToken, syncUpload } from '@/lib/api'
import { EMOTION_TAGS, ENERGY_LABEL } from '@/constants/entry'
import { MOOD_LABEL, MOODS, moodColor, type Mood } from '@/lib/mood'
import { COZY_SPRING } from '@/constants/tokens'
import { playPopSound, playChimeSound } from '@/lib/sound'
import {
  DoodleMood1,
  DoodleMood2,
  DoodleMood3,
  DoodleMood4,
  DoodleMood5,
  DoodleWashiTape,
  DoodleFlower,
} from '@/components/DoodleIcons'

const ENERGIES: Energy[] = [1, 2, 3, 4, 5]

export default function TodayForm({ date, entry }: { date: string; entry?: Entry }) {
  const [mood, setMood] = useState<Mood | null>(entry?.mood ?? null)
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [energy, setEnergy] = useState<Energy | null>(entry?.energy ?? null)
  const [sleep, setSleep] = useState(entry?.sleepHours != null ? String(entry.sleepHours) : '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [justSavedAnimation, setJustSavedAnimation] = useState(false)

  const isInitialMount = useRef(true)
  const debounceTimer = useRef<number | null>(null)

  const markDirty = () => {
    setStatus('idle')
  }

  const toggleTag = (t: string) => {
    playPopSound()
    markDirty()
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

  const handleMoodSelect = (m: Mood) => {
    playPopSound()
    markDirty()
    setMood(m)

    // Hiệu ứng rắc confetti pastel khi chọn mood
    try {
      confetti({
        particleCount: 22,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#F4C6D0', '#CFE3DD', '#F6E3A8', '#CFE0F1', '#D9CFEA'],
        ticks: 120,
        gravity: 0.9,
        scalar: 0.8,
      })
    } catch {
      // Ignored
    }
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
      playChimeSound()
      setJustSavedAnimation(true)
      setTimeout(() => setJustSavedAnimation(false), 2000)

      setLastSavedTime(
        new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      )

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
    }, 1200)

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

  const renderDoodleMood = (m: Mood) => {
    switch (m) {
      case 1:
        return <DoodleMood1 size={46} />
      case 2:
        return <DoodleMood2 size={46} />
      case 3:
        return <DoodleMood3 size={46} />
      case 4:
        return <DoodleMood4 size={46} />
      case 5:
        return <DoodleMood5 size={46} />
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2 lg:items-start select-none">
      {/* Cột trái: Mood 5 khuôn mặt vẽ tay + Cảm xúc + Sức khỏe */}
      <div className="space-y-6">
        {/* Khung chọn 5 khuôn mặt vẽ tay */}
        <section className="relative rounded-3xl border-[1.5px] border-[var(--border)] bg-[var(--surface)] p-6 shadow-[2px_3px_0px_rgba(0,0,0,0.05)]">
          {/* Miếng washi tape hồng trang trí */}
          <div className="absolute -top-2 left-8">
            <DoodleWashiTape color="var(--pastel-pink)" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="font-serif text-lg italic text-[var(--text)]">
              Hôm nay tâm trạng bạn thế nào? ✿
            </p>
            <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              1 — 5 MOOD
            </span>
          </div>

          {/* 5 Khuôn mặt cảm xúc vẽ tay với hiệu ứng nảy (spring) */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label="Tâm trạng">
            {MOODS.map((m) => {
              const selected = mood === m
              return (
                <motion.button
                  key={m}
                  type="button"
                  id={`mood-${m}`}
                  role="radio"
                  aria-checked={selected}
                  aria-label={MOOD_LABEL[m]}
                  onClick={() => handleMoodSelect(m)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  animate={selected ? { scale: [1, 1.25, 1], y: -2 } : { scale: 1, y: 0 }}
                  transition={COZY_SPRING}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-[1.5px] transition-all p-1 ${
                    selected
                      ? 'border-[var(--border-strong)] shadow-[2px_3px_0px_var(--border-strong)]'
                      : 'border-[var(--border)] opacity-70 hover:opacity-100 hover:border-[var(--border-strong)]'
                  }`}
                  style={{ backgroundColor: selected ? moodColor(m) : 'var(--surface)' }}
                >
                  <div className="transition-transform group-hover:scale-105">
                    {renderDoodleMood(m)}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Nhãn tâm trạng cảm xúc */}
          <p className="mt-4 h-6 text-center font-serif text-base italic text-[var(--text)]">
            {mood ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-[var(--mood-2)]" />
                {MOOD_LABEL[mood]}
              </span>
            ) : (
              <span className="text-[var(--text-muted)] font-sans text-xs">
                chạm vào một khuôn mặt vẽ tay để bắt đầu ghi nha
              </span>
            )}
          </p>
        </section>

        {/* Khung thẻ cảm xúc nổi bật (Pill Tags) */}
        <section className="relative rounded-3xl border-[1.5px] border-[var(--border)] bg-[var(--surface)] p-6 shadow-[2px_3px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-serif text-lg italic text-[var(--text)]">
              Cảm xúc nổi bật 🍃
            </p>
            <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              TAGS
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((t) => {
              const on = tags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-xs sm:text-sm font-sans transition-all hover:-translate-y-0.5 ${
                    on
                      ? 'border-[var(--border-strong)] bg-[var(--pastel-mint)] text-[var(--text)] font-medium shadow-[1.5px_2px_0px_var(--border-strong)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </section>

        {/* Mức năng lượng */}
        <section className="relative rounded-3xl border-[1.5px] border-[var(--border)] bg-[var(--surface)] p-6 shadow-[2px_3px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-serif text-lg italic text-[var(--text)]">
              Mức năng lượng cơ thể ⚡
            </p>
            {energy && (
              <span className="font-sans text-xs font-medium text-[var(--text-muted)]">
                {ENERGY_LABEL[energy]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Năng lượng">
            {ENERGIES.map((n) => {
              const isSelected = energy === n
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    playPopSound()
                    markDirty()
                    setEnergy(n)
                  }}
                  className={`rounded-2xl border-[1.5px] py-2.5 text-xs sm:text-sm font-mono font-bold transition-all hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-[var(--border-strong)] bg-[var(--pastel-butter)] text-[var(--text)] shadow-[2px_2px_0px_var(--border-strong)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </section>

        {/* Đồng hồ giờ ngủ với trăng và mặt trời */}
        <SleepClock
          value={sleep !== '' ? Number(sleep) : null}
          onChange={(hours) => {
            markDirty()
            setSleep(String(hours))
          }}
        />
      </div>

      {/* Cột phải: Trang sổ nhật ký có dòng kẻ mờ (Lined Paper) */}
      <div className="space-y-4">
        <motion.section
          animate={
            justSavedAnimation
              ? { scale: [1, 0.98, 1], rotate: [0, -1, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={COZY_SPRING}
          className="relative flex min-h-[460px] flex-col rounded-3xl border-[1.5px] border-[var(--border)] bg-[var(--surface)] p-6 shadow-[3px_4px_0px_rgba(0,0,0,0.05)]"
        >
          {/* Miếng washi tape vàng ở đầu trang giấy */}
          <div className="absolute -top-2 right-12">
            <DoodleWashiTape color="var(--pastel-butter)" />
          </div>

          <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <DoodleFlower size={18} className="text-[var(--pastel-pink)]" />
              <label htmlFor="content" className="font-serif text-xl italic text-[var(--text)]">
                Trang nhật ký hôm nay
              </label>
            </div>
            <div className="font-mono text-[10px] tracking-wider text-[var(--text-muted)]">
              {wordCount} TỪ · {charCount} KÝ TỰ
            </div>
          </div>

          {/* Khung nhập chữ với dòng kẻ mờ như trang sổ giấy */}
          <textarea
            id="content"
            rows={14}
            placeholder="Kể về ngày hôm nay của bạn... Những niềm vui nho nhỏ, một tách trà ngon, hay một suy nghĩ thoáng qua?"
            value={content}
            onChange={(e) => {
              markDirty()
              setContent(e.target.value)
            }}
            className="paper-lined w-full flex-1 resize-y rounded-2xl border-none p-3 font-sans text-[15px] leading-[32px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] bg-[var(--surface)]"
          />

          {/* Thanh trạng thái tự động lưu */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs font-sans text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              {status === 'saving' && (
                <span className="inline-flex items-center gap-1 text-[var(--text)]">
                  <span className="inline-block size-2 animate-ping rounded-full bg-[var(--pastel-pink)]" />
                  đang cất trang giấy vào ngăn tủ...
                </span>
              )}
              {status === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[var(--mood-5)] font-medium">
                  <CloudCheck size={14} className="text-[var(--mood-5)]" />
                  đã lưu êm đềm {lastSavedTime ? `lúc ${lastSavedTime}` : ''} ✿
                </span>
              )}
              {status === 'idle' && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />
                  tự động lưu khi bạn dừng gõ
                </span>
              )}
            </div>

            {!mood && <span className="font-serif italic text-[var(--mood-1)]">chọn tâm trạng để bắt đầu</span>}
          </div>
        </motion.section>

        {/* Nút lưu thủ công dạng Pill Button viền đen nảy lên */}
        <button
          id="save-entry"
          type="submit"
          disabled={!mood || status === 'saving'}
          onClick={playPopSound}
          className="group flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-pink)] py-3.5 font-sans text-sm font-medium text-[var(--text)] shadow-[2px_3px_0px_var(--border-strong)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_var(--border-strong)] active:translate-y-0 disabled:opacity-40"
        >
          {status === 'saved' ? (
            <>
              <Check size={18} /> đã cất giữ trang nhật ký thành công ✿
            </>
          ) : entry ? (
            <>
              <DoodleFlower size={16} className="transition-transform group-hover:rotate-45" /> cập nhật trang hôm nay ✿
            </>
          ) : (
            <>
              <DoodleFlower size={16} className="transition-transform group-hover:rotate-45" /> lưu một chút dịu dàng hôm nay ✿
            </>
          )}
        </button>
      </div>
    </form>
  )
}
