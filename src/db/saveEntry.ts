import { db, type EntryInput } from './db'

/** Tạo mới hoặc cập nhật entry của một ngày (upsert theo `date`). */
export async function saveEntry(input: EntryInput) {
  const now = Date.now()
  await db.transaction('rw', db.entries, async () => {
    const existing = await db.entries.where('date').equals(input.date).first()
    if (existing) {
      await db.entries.update(existing.id, { ...input, updatedAt: now })
    } else {
      await db.entries.add({ ...input, createdAt: now, updatedAt: now } as never)
    }
  })
}
