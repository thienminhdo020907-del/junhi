import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarHeart, PenLine } from 'lucide-react'
import { ROUTES } from '@/constants/app'
import { useEntriesInRange } from '@/db/useEntries'
import { formatFullDate, isSameDay, toKey } from '@/lib/date'
import { MOOD_EMOJI, MOOD_LABEL, moodColor } from '@/lib/mood'
import { ENERGY_LABEL } from '@/constants/entry'

export default function DayView({ date }: { date: Date }) {
  const [today] = useState(() => new Date())
  const key = toKey(date)
  const entries = useEntriesInRange(key, key)
  const entry = entries?.get(key)
  const isToday = isSameDay(date, today)

  return (
    <section className="card" aria-label={formatFullDate(date)}>
      {entry ? (
        <>
          <div className="flex items-center gap-4">
            <div
              className="flex size-16 items-center justify-center rounded-2xl text-3xl shadow-sm"
              style={{ background: moodColor(entry.mood) }}
            >
              {MOOD_EMOJI[entry.mood]}
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Tâm trạng
              </p>
              <p className="text-lg font-bold text-[var(--text)]">{MOOD_LABEL[entry.mood]}</p>
            </div>
          </div>

          {(entry.energy || entry.sleepHours != null) && (
            <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">
              {entry.energy && `⚡ Năng lượng: ${ENERGY_LABEL[entry.energy]}`}
              {entry.energy && entry.sleepHours != null && ' · '}
              {entry.sleepHours != null && `🌙 Ngủ ${entry.sleepHours} giờ`}
            </p>
          )}

          {entry.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text)]"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text)]">
            {entry.content || <span className="italic text-[var(--text-muted)]">Không có ghi chú thêm.</span>}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--border)]">
            <CalendarHeart size={28} />
          </div>
          <p className="text-base font-serif italic font-semibold text-[var(--text)]">
            Chưa có ghi chép nào cho ngày này
          </p>
          <p className="mt-1 max-w-xs text-xs text-[var(--text-muted)]">
            Mỗi ngày trôi qua đều là một mảnh ghép quý giá. Hãy ghi lại vài dòng cảm xúc nhé!
          </p>
          {isToday && (
            <Link
              to={ROUTES.today}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-contrast)] shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              <PenLine size={14} /> Viết nhật ký hôm nay
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
