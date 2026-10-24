import { createContext } from 'react'
import type { User } from '@/lib/api'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
  syncData: () => Promise<{ uploaded: number; downloaded: number }>
}

export const AuthContext = createContext<AuthContextType | null>(null)
