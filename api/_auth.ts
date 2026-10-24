import jwt from 'jsonwebtoken'
import type { IncomingMessage } from 'http'

const JWT_SECRET = process.env.JWT_SECRET || 'junhi-secret-key-change-in-production'

export interface UserPayload {
  id: number
  email: string
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyRequestUser(req: IncomingMessage): UserPayload | null {
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
