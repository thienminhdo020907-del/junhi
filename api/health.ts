import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureTablesExist, getDbPool } from './_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const hasDbUrl = Boolean(process.env.MYSQL_URL || process.env.DATABASE_URL)
    if (!hasDbUrl) {
      return res.status(200).json({
        status: 'warning',
        message: 'Serverless Function hoạt động, nhưng biến môi trường MYSQL_URL chưa được cấu hình.',
      })
    }

    await ensureTablesExist()
    const db = getDbPool()
    const [rows] = await db.query('SELECT 1 as connected')

    return res.status(200).json({
      status: 'ok',
      message: 'Backend API & Database MySQL đã kết nối thành công!',
      db: rows,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({
      status: 'error',
      message: `Không thể kết nối đến cơ sở dữ liệu: ${msg}`,
    })
  }
}
