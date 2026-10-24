import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { ensureTablesExist, getDbPool } from '../_db.js'
import { generateToken } from '../_auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const { email, password } = req.body || {}

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Địa chỉ email không hợp lệ' })
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' })
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    const normalizedEmail = email.trim().toLowerCase()

    // Kiểm tra xem email đã tồn tại chưa
    const [existing] = (await db.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    )) as [Array<{ id: number }>, unknown]

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Email này đã được đăng ký tài khoản' })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const [result] = (await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [normalizedEmail, hash],
    )) as [{ insertId: number }, unknown]

    const userId = result.insertId

    // Tạo bản ghi settings mặc định cho user
    await db.query(
      'INSERT IGNORE INTO user_settings (user_id, reminder_enabled, reminder_time) VALUES (?, FALSE, ?)',
      [userId, '21:00'],
    )

    const token = generateToken({ id: userId, email: normalizedEmail })

    return res.status(201).json({
      message: 'Đăng ký thành công',
      user: { id: userId, email: normalizedEmail },
      token,
    })
  } catch (err: unknown) {
    console.error('Register error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ'
    return res.status(500).json({ error: `Đăng ký thất bại: ${msg}` })
  }
}
