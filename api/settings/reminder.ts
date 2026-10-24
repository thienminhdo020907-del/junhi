import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../_auth.js'
import { ensureTablesExist, getDbPool } from '../_db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const user = verifyRequestUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Chưa đăng nhập' })
  }

  const { enabled, time, timezone } = req.body || {}

  try {
    await ensureTablesExist()
    const db = getDbPool()

    await db.query(
      `
      INSERT INTO user_settings (user_id, reminder_enabled, reminder_time, timezone)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        reminder_enabled = VALUES(reminder_enabled),
        reminder_time = VALUES(reminder_time),
        timezone = COALESCE(VALUES(timezone), timezone),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        user.id,
        Boolean(enabled),
        time || '21:00',
        timezone || 'Asia/Ho_Chi_Minh',
      ],
    )

    return res.status(200).json({ message: 'Cập nhật nhắc nhở thành công' })
  } catch (err: unknown) {
    console.error('Update reminder error:', err)
    return res.status(500).json({ error: 'Lỗi cập nhật cài đặt nhắc nhở' })
  }
}
