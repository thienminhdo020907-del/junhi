import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../_auth'
import { ensureTablesExist, getDbPool } from '../_db'

interface EntryPayload {
  date: string
  mood: number
  energy: number
  sleepHours: number
  tags: string[]
  content: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const user = verifyRequestUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để đồng bộ dữ liệu' })
  }

  const { entries } = req.body || {}

  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Dữ liệu nhật ký không hợp lệ' })
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    let count = 0
    for (const item of entries as EntryPayload[]) {
      if (item && item.date && item.mood) {
        await db.query(
          `
          INSERT INTO entries (user_id, date, mood, energy, sleep_hours, tags, content)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            mood = VALUES(mood),
            energy = VALUES(energy),
            sleep_hours = VALUES(sleep_hours),
            tags = VALUES(tags),
            content = VALUES(content),
            updated_at = CURRENT_TIMESTAMP
          `,
          [
            user.id,
            item.date,
            item.mood,
            item.energy || 3,
            item.sleepHours || 8,
            JSON.stringify(item.tags || []),
            item.content || '',
          ],
        )
        count++
      }
    }

    return res.status(200).json({
      message: 'Đồng bộ lên đám mây thành công',
      syncedCount: count,
    })
  } catch (err: unknown) {
    console.error('Sync upload error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ'
    return res.status(500).json({ error: `Đồng bộ thất bại: ${msg}` })
  }
}
