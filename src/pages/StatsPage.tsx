import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, Flame, Trophy } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { ROUTES } from '@/constants/app'
import { useAllEntries } from '@/db/useEntries'
import {
  monthlyAverages,
  streaks,
  tagCorrelations,
  weekdayAverages,
  weeklyAverages,
  type AvgPoint,
  type TagCount,
} from '@/lib/stats'
import { moodColor, type Mood } from '@/lib/mood'

const BRAND = 'var(--accent)'
const GOOD = 'var(--success)'
const BAD = 'var(--danger)'
const FULL_WEEKDAY = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật']

const axisTick = { fill: 'currentColor', fontSize: 11, opacity: 0.6 }
const tooltipStyle = {
  borderRadius: 14,
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 12,
}
const fmtAvg = (v: unknown) => (typeof v === 'number' ? v.toFixed(1) : '—')

function Section({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function TrendChart({ data }: { data: AvgPoint[] }) {
  return (
    <div className="h-48 text-[var(--text-muted)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
          <XAxis
            dataKey="label"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [fmtAvg(v), 'Mood TB']}
            labelStyle={{ opacity: 0.7 }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke={BRAND}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: BRAND, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function WeekdayChart({ data, best, worst }: { data: AvgPoint[]; best: number; worst: number }) {
  return (
    <div className="h-44 text-[var(--text-muted)]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.08 }}
            contentStyle={tooltipStyle}
            formatter={(v) => [fmtAvg(v), 'Mood TB']}
            labelStyle={{ opacity: 0.7 }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === best ? GOOD : i === worst ? BAD : BRAND}
                fillOpacity={i === best || i === worst ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TagList({
  title,
  items,
  days,
  color,
}: {
  title: string
  items: TagCount[]
  days: number
  color: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-[var(--text-muted)]">
        {title} <span className="opacity-70">({days} ngày)</span>
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Chưa có tag nào.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.tag}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t.tag}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t.count} lần · {Math.round(t.share * 100)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.share * 100}%`, background: color }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function StatsPage() {
  const entries = useAllEntries()
  const [today] = useState(() => new Date())
  const [range, setRange] = useState<'week' | 'month'>('week')

  if (!entries) return <PageHeader title="Thống kê" />

  if (entries.length === 0) {
    return (
      <>
        <PageHeader title="Thống kê" subtitle="Xu hướng tâm trạng của bạn" />
        <EmptyState
          icon={BarChart3}
          title="Chưa có dữ liệu thống kê"
          description="Hãy ghi lại tâm trạng và thời gian ngủ trong vài ngày để Junhi vẽ biểu đồ xu hướng, chuỗi check-in và thống kê cảm xúc cho bạn nhé!"
          actionLabel="Ghi nhận tâm trạng hôm nay"
          actionTo={ROUTES.today}
        />
      </>
    )
  }

  const trend = range === 'week' ? weeklyAverages(entries, today) : monthlyAverages(entries, today)
  const { current, longest } = streaks(entries, today)
  const weekdays = weekdayAverages(entries)
  const withData = weekdays.filter((d) => d.avg !== null)
  const best = withData.length
    ? weekdays.indexOf(withData.reduce((a, b) => (b.avg! > a.avg! ? b : a)))
    : -1
  const worst = withData.length
    ? weekdays.indexOf(withData.reduce((a, b) => (b.avg! < a.avg! ? b : a)))
    : -1
  const tags = tagCorrelations(entries)
  const overall = entries.reduce((s, e) => s + e.mood, 0) / entries.length

  return (
    <>
      <PageHeader title="Thống kê" subtitle={`${entries.length} ngày đã ghi nhật ký`} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-3 gap-3 lg:col-span-2">
          <div className="card !p-4 text-center">
            <Flame className="mx-auto text-orange-500" size={20} />
            <p id="streak-current" className="mt-1 text-2xl font-bold text-[var(--text)]">
              {current}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">Chuỗi hiện tại</p>
          </div>
          <div className="card !p-4 text-center">
            <Trophy className="mx-auto text-yellow-500" size={20} />
            <p id="streak-longest" className="mt-1 text-2xl font-bold text-[var(--text)]">
              {longest}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">Dài nhất</p>
          </div>
          <div className="card !p-4 text-center">
            <span
              className="mx-auto block size-5 rounded-full"
              style={{ background: moodColor(Math.round(overall) as Mood) }}
            />
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">{overall.toFixed(1)}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Mood TB</p>
          </div>
        </div>

        <Section title="Mood trung bình">
          <div className="mb-2 grid grid-cols-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 text-sm">
            {(['week', 'month'] as const).map((r) => (
              <button
                key={r}
                id={`stats-range-${r}`}
                onClick={() => setRange(r)}
                className={`rounded-lg py-1.5 font-medium transition-all ${
                  range === r
                    ? 'border border-[var(--border-strong)] bg-[var(--pastel-mint)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {r === 'week' ? '12 tuần' : '12 tháng'}
              </button>
            ))}
          </div>
          <TrendChart data={trend} />
        </Section>

        <Section title="Theo ngày trong tuần">
          <WeekdayChart data={weekdays} best={best} worst={worst} />
          {best >= 0 && best !== worst && (
            <p className="mt-2 text-sm">
              <span style={{ color: GOOD }}>▲ {FULL_WEEKDAY[best]}</span> cao nhất (
              {weekdays[best].avg}) · <span style={{ color: BAD }}>▼ {FULL_WEEKDAY[worst]}</span>{' '}
              thấp nhất ({weekdays[worst].avg})
            </p>
          )}
        </Section>

        <Section title="Tag đi cùng tâm trạng" className="lg:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <TagList
              title="Ngày mood tốt (4–5)"
              items={tags.good}
              days={tags.goodDays}
              color={GOOD}
            />
            <TagList title="Ngày mood tệ (1–2)" items={tags.bad} days={tags.badDays} color={BAD} />
          </div>
        </Section>
      </div>
    </>
  )
}
