import type { VercelRequest } from '@vercel/node'
import type { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'junhi-secret-key-change-in-production'

export interface UserPayload {
  id: number
  email: string
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyRequestUser(req: VercelRequest | IncomingMessage): UserPayload | null {
  const authHeader = req.headers.authorization
  const headerStr = Array.isArray(authHeader) ? authHeader[0] : authHeader
  if (!headerStr || !headerStr.startsWith('Bearer ')) {
    return null
  }

  const token = headerStr.slice(7).trim()
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    return decoded
  } catch {
    return null
  }
}
