import { db, type Entry, type Setting } from '@/db/db'
import { toKey } from './date'

export interface BackupData {
  version: number
  appName: string
  exportedAt: string
  entries: Entry[]
  settings?: Setting[]
}

/** Xuất toàn bộ dữ liệu ra file JSON để tải về */
export async function exportBackup(): Promise<void> {
  const entries = await db.entries.toArray()
  const settings = await db.settings.toArray()

  const backupData: BackupData = {
    version: 1,
    appName: 'Junhi',
    exportedAt: new Date().toISOString(),
    entries,
    settings: settings.filter((s) => s.key !== 'security_pin'), // Không xuất mã PIN để bảo mật
  }

  const jsonStr = JSON.stringify(backupData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `junhi-backup-${toKey(new Date())}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Nhập dữ liệu từ file JSON vào IndexedDB */
export async function importBackup(file: File): Promise<{ count: number }> {
  const text = await file.text()
  let data: unknown

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Tập tin không phải là định dạng JSON hợp lệ.')
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu sao lưu không đúng định dạng.')
  }

  const backup = data as Partial<BackupData>

  const entries = backup.entries
  if (!Array.isArray(entries)) {
    throw new Error('Không tìm thấy danh sách bài viết trong tập tin sao lưu.')
  }

  // Nạp dữ liệu vào IndexedDB
  await db.transaction('rw', db.entries, db.settings, async () => {
    // Nhập entries (dùng put để chèn hoặc ghi đè theo date/id)
    if (entries.length > 0) {
      for (const entry of entries) {
        if (entry.date && entry.mood) {
          const existing = await db.entries.where('date').equals(entry.date).first()
          const { id: _unused, ...entryWithoutId } = entry
          if (existing) {
            await db.entries.put({ ...entryWithoutId, id: existing.id })
          } else {
            await db.entries.add(entryWithoutId as Omit<Entry, 'id'>)
          }
        }
      }
    }

    // Nhập settings nếu có
    if (Array.isArray(backup.settings)) {
      for (const s of backup.settings) {
        if (s.key && s.key !== 'security_pin') {
          await db.settings.put(s)
        }
      }
    }
  })

  return { count: entries.length }
}
