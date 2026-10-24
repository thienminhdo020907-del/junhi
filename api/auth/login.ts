import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { ensureTablesExist, getDbPool } from '../_db.js'
import { generateToken } from '../_auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' })
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    const normalizedEmail = String(email).trim().toLowerCase()

    const [rows] = (await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    )) as [Array<{ id: number; email: string; password_hash: string }>, unknown]

    const user = rows?.[0]
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' })
    }

    const matched = await bcrypt.compare(String(password), user.password_hash)
    if (!matched) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' })
    }

    const token = generateToken({ id: user.id, email: user.email })

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      user: { id: user.id, email: user.email },
      token,
    })
  } catch (err: unknown) {
    console.error('Login error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ'
    return res.status(500).json({ error: `Đăng nhập thất bại: ${msg}` })
  }
}
