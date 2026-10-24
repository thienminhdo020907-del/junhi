import type { Entry } from '@/db/db'
import {
  addDays,
  fromKey,
  MONTH_SHORT,
  startOfWeek,
  toKey,
  WEEKDAY_SHORT,
  weekdayIndex,
} from './date'

export interface AvgPoint {
  label: string
  /** Mood trung bình, null nếu kỳ đó không có dữ liệu */
  avg: number | null
  count: number
}

const average = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null

const round1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10)

/** Mood trung bình của `n` tuần gần nhất (tuần bắt đầu Thứ Hai), cũ -> mới. */
export function weeklyAverages(entries: Entry[], today: Date, n = 12): AvgPoint[] {
  const buckets = new Map<string, number[]>()
  entries.forEach((e) => {
    const k = toKey(startOfWeek(fromKey(e.date)))
    buckets.set(k, [...(buckets.get(k) ?? []), e.mood])
  })
  const thisWeek = startOfWeek(today)
  return Array.from({ length: n }, (_, i) => {
    const start = addDays(thisWeek, -7 * (n - 1 - i))
    const moods = buckets.get(toKey(start)) ?? []
    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      avg: round1(average(moods)),
      count: moods.length,
    }
  })
}

/** Mood trung bình của `n` tháng gần nhất, cũ -> mới. */
export function monthlyAverages(entries: Entry[], today: Date, n = 12): AvgPoint[] {
  const buckets = new Map<string, number[]>()
  entries.forEach((e) => {
    const k = e.date.slice(0, 7)
    buckets.set(k, [...(buckets.get(k) ?? []), e.mood])
  })
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (n - 1 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const moods = buckets.get(key) ?? []
    return { label: MONTH_SHORT[d.getMonth()], avg: round1(average(moods)), count: moods.length }
  })
}

/** Chuỗi ngày check-in liên tiếp. Chuỗi hiện tại vẫn tính nếu hôm nay chưa check-in nhưng hôm qua có. */
export function streaks(entries: Entry[], today: Date) {
  const days = new Set(entries.map((e) => e.date))

  let cursor = days.has(toKey(today)) ? today : addDays(today, -1)
  let current = 0
  while (days.has(toKey(cursor))) {
    current++
    cursor = addDays(cursor, -1)
  }

  const sorted = [...days].sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const d of sorted) {
    run = prev && toKey(addDays(fromKey(prev), 1)) === d ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = d
  }
  return { current, longest }
}

/** Mood trung bình theo thứ trong tuần (T2..CN). */
export function weekdayAverages(entries: Entry[]): AvgPoint[] {
  const buckets: number[][] = Array.from({ length: 7 }, () => [])
  entries.forEach((e) => buckets[weekdayIndex(fromKey(e.date))].push(e.mood))
  return buckets.map((moods, i) => ({
    label: WEEKDAY_SHORT[i],
    avg: round1(average(moods)),
    count: moods.length,
  }))
}

export interface TagCount {
  tag: string
  count: number
  /** Tỉ lệ trên tổng số ngày thuộc nhóm (0..1) */
  share: number
}

/** Tag xuất hiện nhiều nhất vào những ngày mood tốt (>= 4) và tệ (<= 2). */
export function tagCorrelations(entries: Entry[], top = 5) {
  const rank = (group: Entry[]): TagCount[] => {
    const counts = new Map<string, number>()
    group.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return [...counts]
      .map(([tag, count]) => ({ tag, count, share: count / group.length }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, top)
  }
  const good = entries.filter((e) => e.mood >= 4)
  const bad = entries.filter((e) => e.mood <= 2)
  return { good: rank(good), bad: rank(bad), goodDays: good.length, badDays: bad.length }
}
