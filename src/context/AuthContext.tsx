import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { db, type Entry } from '@/db/db'
import {
  authGetMe,
  authLogin,
  authRegister,
  getStoredToken,
  setStoredToken,
  syncDownload,
  syncUpload,
  type User,
} from '@/lib/api'
import { AuthContext } from './auth-context-definition'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()))
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem('junhi_last_synced')
    return saved ? new Date(saved) : null
  })

  // Kiểm tra phiên đăng nhập khi mở app
  useEffect(() => {
    const token = getStoredToken()
    if (!token) return

    authGetMe()
      .then((res) => {
        setUser(res.user)
      })
      .catch(() => {
        setStoredToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const syncData = useCallback(async () => {
    if (!getStoredToken()) {
      throw new Error('Bạn cần đăng nhập để đồng bộ dữ liệu')
    }

    setIsSyncing(true)
    try {
      // 1. Tải local entries
      const localEntries = await db.entries.toArray()

      // 2. Tải cloud entries
      const { entries: cloudEntries } = await syncDownload()

      // 3. Đẩy local lên Cloud
      const toUpload = localEntries.map((e) => ({
        date: e.date,
        mood: e.mood,
        energy: e.energy ?? 3,
        sleepHours: e.sleepHours ?? 8,
        tags: e.tags,
        content: e.content,
      }))

      let uploaded = 0
      if (toUpload.length > 0) {
        const uploadRes = await syncUpload(toUpload)
        uploaded = uploadRes.syncedCount
      }

      // 4. Hợp nhất Cloud entries về local IndexedDB
      let downloaded = 0
      const localMap = new Map(localEntries.map((e) => [e.date, e]))

      await db.transaction('rw', db.entries, async () => {
        const now = Date.now()
        for (const cloud of cloudEntries) {
          const local = localMap.get(cloud.date)
          if (!local) {
            await db.entries.add({
              date: cloud.date,
              mood: cloud.mood as Entry['mood'],
              energy: (cloud.energy || 3) as Entry['energy'],
              sleepHours: cloud.sleepHours,
              tags: cloud.tags,
              content: cloud.content,
              createdAt: now,
              updatedAt: now,
            })
            downloaded++
          }
        }
      })

      const now = new Date()
      setLastSyncedAt(now)
      localStorage.setItem('junhi_last_synced', now.toISOString())

      return { uploaded, downloaded }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const res = await authLogin(email, pass)
    setStoredToken(res.token)
    setUser(res.user)
    // Tự động đồng bộ sau khi đăng nhập
    setTimeout(() => {
      syncData().catch((err) => console.error('Auto sync after login failed:', err))
    }, 500)
  }

  const register = async (email: string, pass: string) => {
    const res = await authRegister(email, pass)
    setStoredToken(res.token)
    setUser(res.user)
    // Tự động đẩy local entries lên cho tài khoản mới
    setTimeout(() => {
      syncData().catch((err) => console.error('Auto sync after register failed:', err))
    }, 500)
  }

  const logout = () => {
    setStoredToken(null)
    setUser(null)
    setLastSyncedAt(null)
    localStorage.removeItem('junhi_last_synced')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSyncing,
        lastSyncedAt,
        login,
        register,
        logout,
        syncData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
