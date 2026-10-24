import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../_auth.js'
import { ensureTablesExist, getDbPool } from '../_db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const user = verifyRequestUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tải dữ liệu' })
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    const [rows] = (await db.query(
      `
      SELECT date, mood, energy, sleep_hours, tags, content
      FROM entries
      WHERE user_id = ?
      ORDER BY date ASC
      `,
      [user.id],
    )) as [
      Array<{
        date: string
        mood: number
        energy: number
        sleep_hours: number
        tags: unknown
        content: string
      }>,
      unknown,
    ]

    const entries = (rows || []).map((r) => {
      let parsedTags: string[] = []
      if (typeof r.tags === 'string') {
        try {
          parsedTags = JSON.parse(r.tags)
        } catch {
          parsedTags = []
        }
      } else if (Array.isArray(r.tags)) {
        parsedTags = r.tags
      }

      return {
        date: r.date,
        mood: Number(r.mood),
        energy: Number(r.energy),
        sleepHours: Number(r.sleep_hours),
        tags: parsedTags,
        content: r.content || '',
      }
    })

    return res.status(200).json({ entries })
  } catch (err: unknown) {
    console.error('Sync download error:', err)
    return res.status(500).json({ error: 'Không thể tải dữ liệu từ máy chủ' })
  }
}
