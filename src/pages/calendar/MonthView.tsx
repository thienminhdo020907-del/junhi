import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEntriesInRange } from '@/db/useEntries'
import { daysInMonth, isSameDay, toKey, WEEKDAY_SHORT, weekdayIndex } from '@/lib/date'
import { moodColor } from '@/lib/mood'
import { DoodleWashiTape } from '@/components/DoodleIcons'
import { playPopSound } from '@/lib/sound'

interface Props {
  date: Date
  onOpenDay: (d: Date) => void
}

export default function MonthView({ date, onOpenDay }: Props) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const total = daysInMonth(y, m)
  const offset = weekdayIndex(new Date(y, m, 1))
  const entries = useEntriesInRange(toKey(new Date(y, m, 1)), toKey(new Date(y, m, total)))
  const [today] = useState(() => new Date())

  return (
    <div className="relative rounded-3xl border-[1.5px] border-[#2B2724]/20 bg-[#FBFAF7] p-6 shadow-[3px_4px_0px_rgba(43,39,36,0.06)] dark:border-white/20 dark:bg-[#282421]">
      {/* Miếng washi tape trang trí trên đầu lịch */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <DoodleWashiTape color="#CFE3DD" />
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center font-mono text-[11px] font-bold text-[#7A736B] dark:text-[#A8A199] tracking-wider uppercase">
        {WEEKDAY_SHORT.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      {/* Lưới các ngày trong tháng dạng miếng sticker giấy pastel */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const d = new Date(y, m, i + 1)
          const e = entries?.get(toKey(d))
          const isToday = isSameDay(d, today)

          return (
            <motion.button
              key={i}
              type="button"
              id={`month-day-${toKey(d)}`}
              onClick={() => {
                playPopSound()
                onOpenDay(d)
              }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.94 }}
              aria-label={`Ngày ${i + 1}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-[1.5px] font-sans text-xs sm:text-sm font-medium transition-all ${
                isToday
                  ? 'border-[#2B2724] ring-2 ring-[#2B2724] shadow-[2px_2px_0px_#2B2724] dark:border-white dark:ring-white'
                  : 'border-[#2B2724]/15 hover:border-[#2B2724] hover:shadow-[1.5px_2px_0px_#2B2724] dark:border-white/15'
              } ${e ? 'text-[#2B2724] font-bold' : 'text-[#7A736B] dark:text-[#A8A199]'}`}
              style={{ background: e ? moodColor(e.mood) : 'var(--empty-cell)' }}
            >
              <span>{i + 1}</span>
              {e && (
                <span className="absolute bottom-1 size-1 rounded-full bg-[#2B2724]/50" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
