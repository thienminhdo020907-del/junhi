import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

export interface ReminderSettings {
  enabled: boolean
  /** Giờ nhắc dạng HH:mm (giờ địa phương) */
  time: string
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, time: '21:00' }

const REMINDER_KEY = 'reminder'
/** Ngày (YYYY-MM-DD) đã gửi thông báo gần nhất; dùng chung với reminder-sw.js để không nhắc trùng. */
const LAST_NOTIFIED_KEY = 'reminderLastNotified'

export function useReminder() {
  const result = useLiveQuery(async () => {
    const row = await db.settings.get(REMINDER_KEY)
    const last = await db.settings.get(LAST_NOTIFIED_KEY)
    return {
      settings: (row?.value as ReminderSettings | undefined) ?? DEFAULT_REMINDER,
      lastNotified: last?.value as string | undefined,
    }
  })

  return {
    loading: result === undefined,
    settings: result?.settings ?? DEFAULT_REMINDER,
    lastNotified: result?.lastNotified,
    save: (value: ReminderSettings) => db.settings.put({ key: REMINDER_KEY, value }),
    markNotified: (date: string) => db.settings.put({ key: LAST_NOTIFIED_KEY, value: date }),
  }
}

/** 'HH:mm' -> số phút từ 00:00 */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
