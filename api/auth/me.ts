import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyRequestUser } from '../_auth.js'
import { ensureTablesExist, getDbPool } from '../_db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const user = verifyRequestUser(req)
  if (!user) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' })
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    const [rows] = (await db.query(
      'SELECT id, email, created_at FROM users WHERE id = ? LIMIT 1',
      [user.id],
    )) as [Array<{ id: number; email: string; created_at: string }>, unknown]

    const currentUser = rows?.[0]
    if (!currentUser) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    }

    const [settingsRows] = (await db.query(
      'SELECT reminder_enabled, reminder_time FROM user_settings WHERE user_id = ? LIMIT 1',
      [user.id],
    )) as [Array<{ reminder_enabled: number; reminder_time: string }>, unknown]

    const settings = settingsRows?.[0]

    return res.status(200).json({
      user: currentUser,
      settings: settings
        ? {
            reminderEnabled: Boolean(settings.reminder_enabled),
            reminderTime: settings.reminder_time,
          }
        : null,
    })
  } catch (err: unknown) {
    console.error('Me error:', err)
    return res.status(500).json({ error: 'Lỗi xác thực người dùng' })
  }
}
