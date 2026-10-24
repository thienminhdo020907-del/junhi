const pad = (n: number) => String(n).padStart(2, '0')

/** Date -> 'YYYY-MM-DD' (giờ địa phương) */
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

export const addYears = (d: Date, n: number) => new Date(d.getFullYear() + n, 0, 1)

/** Thứ trong tuần, Thứ Hai = 0 ... Chủ Nhật = 6 */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7

export const startOfWeek = (d: Date) => addDays(d, -weekdayIndex(d))

export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

export const isSameDay = (a: Date, b: Date) => toKey(a) === toKey(b)

export const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export const MONTH_SHORT = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
]

export const formatFullDate = (d: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
