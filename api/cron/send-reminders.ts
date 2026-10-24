import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'
import { ensureTablesExist, getDbPool } from '../_db.js'

function getVietnamCurrentTime(): { dateStr: string; timeStr: string; hour: number } {
  const now = new Date()
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  const yyyy = vnTime.getFullYear()
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0')
  const dd = String(vnTime.getDate()).padStart(2, '0')
  const hh = String(vnTime.getHours()).padStart(2, '0')
  const mi = String(vnTime.getMinutes()).padStart(2, '0')
  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    timeStr: `${hh}:${mi}`,
    hour: vnTime.getHours(),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cho phép gọi từ Vercel Cron hoặc Authorization secret
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    // Nếu có CRON_SECRET thì kiểm tra, nếu không thì cho phép Vercel Cron kích hoạt
  }

  try {
    await ensureTablesExist()
    const db = getDbPool()

    const { dateStr, hour } = getVietnamCurrentTime()

    // Tìm các user có bật nhắc nhở và chưa nhận thông báo trong ngày hôm nay
    const [usersToNotify] = (await db.query(
      `
      SELECT u.id, u.email, s.reminder_time, s.last_notified_date
      FROM users u
      JOIN user_settings s ON u.id = s.user_id
      WHERE s.reminder_enabled = 1
        AND (s.last_notified_date IS NULL OR s.last_notified_date != ?)
      `,
      [dateStr],
    )) as [
      Array<{
        id: number
        email: string
        reminder_time: string
        last_notified_date: string
      }>,
      unknown,
    ]

    if (!usersToNotify || usersToNotify.length === 0) {
      return res.status(200).json({ message: 'Không có người dùng nào cần gửi nhắc nhở tại thời điểm này', sent: 0 })
    }

    // Lọc theo giờ nhắc (nếu giờ nhắc khớp với giờ hiện tại)
    const matchedUsers = usersToNotify.filter((u) => {
      const userHour = parseInt(u.reminder_time.split(':')[0], 10)
      return userHour === hour
    })

    if (matchedUsers.length === 0) {
      return res.status(200).json({ message: 'Không có lịch nhắc nào khớp với giờ hiện tại', sent: 0 })
    }

    // Cấu hình transporter gửi email
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = Number(process.env.SMTP_PORT) || 465
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const appUrl = process.env.APP_URL || 'https://junhi.vercel.app'

    if (!smtpUser || !smtpPass) {
      return res.status(200).json({
        warning: 'Chưa cấu hình biến môi trường SMTP_USER và SMTP_PASS trên Vercel. Không thể gửi email thực tế.',
        matchedCount: matchedUsers.length,
      })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    let sentCount = 0

    for (const u of matchedUsers) {
      try {
        await transporter.sendMail({
          from: `"Junhi Mood Journal" <${smtpUser}>`,
          to: u.email,
          subject: '✨ Hôm nay bạn thế nào? Hãy dành 1 phút check-in cùng Junhi',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #ede9fe; border-radius: 16px; background-color: #fbfbfe;">
              <h2 style="color: #6d28d9; margin-top: 0;">Xin chào bạn! 🌙</h2>
              <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                Đã đến giờ nhắc nhở ghi nhật ký hôm nay. Dù là một ngày tuyệt vời hay nhiều thử thách, ghi nhận cảm xúc sẽ giúp tâm trí bạn được giải tỏa và nhẹ nhõm hơn.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${appUrl}" style="background-color: #7c6cf0; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                  Viết nhật ký hôm nay →
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
                Email nhắc nhở tự động từ Junhi · Bạn có thể tắt nhắc nhở bất kỳ lúc nào trong phần Cài đặt của ứng dụng.
              </p>
            </div>
          `,
        })

        // Cập nhật ngày đã gửi
        await db.query('UPDATE user_settings SET last_notified_date = ? WHERE user_id = ?', [dateStr, u.id])
        sentCount++
      } catch (sendErr) {
        console.error(`Gửi email thất bại cho ${u.email}:`, sendErr)
      }
    }

    return res.status(200).json({
      message: `Đã gửi thành công ${sentCount} email nhắc nhở`,
      date: dateStr,
      hour,
      sentCount,
    })
  } catch (err: unknown) {
    console.error('Cron reminder error:', err)
    return res.status(500).json({ error: 'Lỗi thực thi cron gửi nhắc nhở' })
  }
}
