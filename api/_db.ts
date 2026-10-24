import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getDbPool(): mysql.Pool {
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

export async function ensureTablesExist(): Promise<void> {
  if (initialized) return
  const db = getDbPool()

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
      user_id INT PRIMARY KEY,
      reminder_enabled BOOLEAN DEFAULT FALSE,
      reminder_time VARCHAR(5) DEFAULT '21:00',
      timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
      last_notified_date VARCHAR(10) DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)

  initialized = true
}
