import type { VercelRequest, VercelResponse } from '@vercel/node'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const JWT_SECRET = process.env.JWT_SECRET || 'junhi-secret-key-change-in-production'

// --- DATABASE POOL ---
let pool: mysql.Pool | null = null

function getDbPool(): mysql.Pool {
  if (pool) return pool

  const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL

  if (connectionUri) {
    pool = mysql.createPool({
      uri: connectionUri,
      ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  } else {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'junhi',
      ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  return pool
}

let initialized = false

async function ensureTablesExist(): Promise<void> {
  if (initialized) return
  const db = getDbPool()

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date VARCHAR(10) NOT NULL,
        mood TINYINT NOT NULL,
        energy TINYINT NOT NULL,
        sleep_hours DECIMAL(4,2) NOT NULL,
        tags JSON,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_date (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE,
        reminder_enabled BOOLEAN DEFAULT FALSE,
        reminder_time VARCHAR(5) DEFAULT '21:00',
        timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
        last_notified_date VARCHAR(10) DEFAULT '',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
  } catch (tableErr) {
    console.warn('Lưu ý: Không thể tự động chạy CREATE TABLE (có thể do bảng đã tồn tại hoặc tài khoản không có quyền CREATE):', tableErr)
  }

  initialized = true
}

// --- AUTH HELPERS ---
interface UserPayload {
  id: number
  email: string
}

function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' })
}

function verifyRequestUser(req: VercelRequest): UserPayload | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7).trim()
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    return decoded
  } catch {
    return null
  }
}

// --- MAIN UNIFIED HANDLER ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bật CORS cho mọi yêu cầu
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Chuẩn hóa path URL (ví dụ: "/api/auth/register?foo=bar" -> "/api/auth/register")
  let pathname = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/'
  if (req.query?.path) {
    const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path)
    if (subpath && !pathname.includes(subpath)) {
      pathname = `/api/${subpath}`
    }
  }

  try {
    // 1. HEALTH CHECK
    if (pathname === '/api/health' || pathname === '/api') {
      const hasDbUrl = Boolean(process.env.MYSQL_URL || process.env.DATABASE_URL)
      if (!hasDbUrl) {
        return res.status(200).json({
          status: 'warning',
          message: 'Serverless Function đã sẵn sàng, nhưng biến môi trường MYSQL_URL chưa được cấu hình.',
        })
      }

      await ensureTablesExist()
      const db = getDbPool()
      const [rows] = await db.query('SELECT 1 as connected')

      return res.status(200).json({
        status: 'ok',
        message: 'Backend Junhi API & MySQL Database đã kết nối thành công!',
        db: rows,
      })
    }

    // 2. AUTH: ĐĂNG KÝ
    if (pathname === '/api/auth/register') {
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

      await ensureTablesExist()
      const db = getDbPool()
      const normalizedEmail = email.trim().toLowerCase()

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
    }

    // 3. AUTH: ĐĂNG NHẬP
    if (pathname === '/api/auth/login') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
      }

      const { email, password } = req.body || {}
      if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' })
      }

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

      const match = await bcrypt.compare(String(password), user.password_hash)
      if (!match) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' })
      }

      const token = generateToken({ id: user.id, email: user.email })

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        user: { id: user.id, email: user.email },
        token,
      })
    }

    // 4. AUTH: THÔNG TIN TÀI KHOẢN (ME)
    if (pathname === '/api/auth/me') {
      const user = verifyRequestUser(req)
      if (!user) {
        return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn' })
      }

      await ensureTablesExist()
      const db = getDbPool()

      const [settingsRows] = (await db.query(
        'SELECT reminder_enabled, reminder_time, timezone FROM user_settings WHERE user_id = ? LIMIT 1',
        [user.id],
      )) as [
        Array<{
          reminder_enabled: number | boolean
          reminder_time: string
          timezone: string
        }>,
        unknown,
      ]

      const s = settingsRows?.[0]

      return res.status(200).json({
        user: { id: user.id, email: user.email },
        settings: s
          ? {
              reminderEnabled: Boolean(s.reminder_enabled),
              reminderTime: s.reminder_time,
              timezone: s.timezone,
            }
          : null,
      })
    }

    // 5. SYNC: TẢI BÀI VIẾT TỪ CLOUD VỀ CLIENT (DOWNLOAD)
    if (pathname === '/api/sync/download') {
      const user = verifyRequestUser(req)
      if (!user) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập để tải dữ liệu' })
      }

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
    }

    // 6. SYNC: ĐẨY BÀI VIẾT LÊN CLOUD (UPLOAD)
    if (pathname === '/api/sync/upload') {
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

      await ensureTablesExist()
      const db = getDbPool()

      let count = 0
      for (const item of entries) {
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
    }

    // 7. SETTINGS: CẬP NHẬT NHẮC NHỞ EMAIL
    if (pathname === '/api/settings/reminder') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
      }

      const user = verifyRequestUser(req)
      if (!user) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập' })
      }

      const { enabled, time } = req.body || {}

      await ensureTablesExist()
      const db = getDbPool()

      await db.query(
        `
        INSERT INTO user_settings (user_id, reminder_enabled, reminder_time)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          reminder_enabled = VALUES(reminder_enabled),
          reminder_time = VALUES(reminder_time),
          updated_at = CURRENT_TIMESTAMP
        `,
        [user.id, Boolean(enabled), time || '21:00'],
      )

      return res.status(200).json({ message: 'Đã cập nhật cài đặt nhắc nhở' })
    }

    // 8. CRON: GỬI EMAIL NHẮC NHỞ
    if (pathname === '/api/cron/send-reminders') {
      await ensureTablesExist()
      const db = getDbPool()

      const now = new Date()
      const vnTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
      const todayDate = now.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
      })

      const [rows] = (await db.query(
        `
        SELECT u.id, u.email, s.reminder_time, s.last_notified_date
        FROM users u
        INNER JOIN user_settings s ON u.id = s.user_id
        WHERE s.reminder_enabled = TRUE
          AND s.reminder_time = ?
          AND (s.last_notified_date IS NULL OR s.last_notified_date != ?)
        `,
        [vnTimeStr, todayDate],
      )) as [Array<{ id: number; email: string; reminder_time: string; last_notified_date: string }>, unknown]

      if (!rows || rows.length === 0) {
        return res.status(200).json({ message: 'Không có người dùng nào cần gửi nhắc nhở lúc này', count: 0 })
      }

      const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
      const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS
      if (!smtpUser || !smtpPass) {
        return res.status(200).json({
          warning: 'Chưa cấu hình biến môi trường SMTP_USER / SMTP_PASS để gửi email thật',
          matchedUsers: rows.length,
        })
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      })

      let sentCount = 0
      for (const target of rows) {
        try {
          await transporter.sendMail({
            from: `"Junhi - Nhật ký & Mood" <${smtpUser}>`,
            to: target.email,
            subject: '🌿 Bạn ơi, hôm nay của bạn thế nào? Dành 1 phút ghi lại nhé!',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #fafafa; border-radius: 20px; border: 1px solid #eaeaea;">
                <h2 style="color: #6366f1; margin-top: 0;">Junhi nhắc bạn 💜</h2>
                <p style="font-size: 15px; color: #374151; line-height: 1.6;">
                  Một ngày nữa đã trôi qua. Dù hôm nay là ngày rực rỡ hay có chút mệt mỏi, việc ghi lại cảm xúc và giấc ngủ sẽ giúp tâm trí bạn nhẹ nhàng hơn rất nhiều.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://junhi.vercel.app/today" style="background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; display: inline-block;">
                    Ghi nhật ký hôm nay
                  </a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                  Email tự động theo giờ bạn đã chọn trên ứng dụng Junhi.
                </p>
              </div>
            `,
          })

          await db.query(
            'UPDATE user_settings SET last_notified_date = ? WHERE user_id = ?',
            [todayDate, target.id],
          )
          sentCount++
        } catch (mailErr) {
          console.error(`Gửi mail lỗi cho ${target.email}:`, mailErr)
        }
      }

      return res.status(200).json({ message: `Đã gửi thành công ${sentCount} email nhắc nhở`, sentCount })
    }

    // 9. NẾU KHÔNG KHỚP ROUTE NÀO
    return res.status(404).json({ error: `Đường dẫn API không tồn tại: ${pathname}` })
  } catch (err: unknown) {
    console.error('API Error:', err)
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ nội bộ'
    return res.status(500).json({ error: `Lỗi hệ thống: ${msg}` })
  }
}
