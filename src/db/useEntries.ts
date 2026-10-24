import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Entry } from './db'

/** Lấy các entry trong khoảng ngày [from, to] (YYYY-MM-DD), trả về Map theo ngày. */
export function useEntriesInRange(from: string, to: string) {
  return useLiveQuery(async () => {
    const list = await db.entries.where('date').between(from, to, true, true).toArray()
    return new Map<string, Entry>(list.map((e) => [e.date, e]))
  }, [from, to])
}

/** Toàn bộ entry, sắp theo ngày. undefined khi đang tải. */
export function useAllEntries() {
  return useLiveQuery(() => db.entries.orderBy('date').toArray())
}
