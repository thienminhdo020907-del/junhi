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

const CURRENT_USER_KEY = 'junhi_current_user_id'
const LAST_SYNCED_KEY = 'junhi_last_synced'

/** Xóa sạch dữ liệu cục bộ IndexedDB để đảm bảo tuyệt đối không lẫn lộn dữ liệu giữa các tài khoản */
async function clearLocalData() {
  try {
    await db.transaction('rw', db.entries, db.settings, async () => {
      await db.entries.clear()
      await db.settings.clear()
    })
  } catch (err) {
    console.error('Error clearing local data:', err)
  }
}

/** Nạp danh sách entries từ Cloud về IndexedDB cục bộ */
async function populateFromCloud(
  cloudEntries: Array<{
    date: string
    mood: number
    energy: number
    sleepHours: number
    tags: string[]
    content: string
  }>,
) {
  const now = Date.now()
  await db.transaction('rw', db.entries, async () => {
    await db.entries.clear()
    for (const item of cloudEntries) {
      await db.entries.add({
        date: item.date,
        mood: item.mood as Entry['mood'],
        energy: (item.energy || 3) as Entry['energy'],
        sleepHours: item.sleepHours,
        tags: item.tags || [],
        content: item.content || '',
        createdAt: now,
        updatedAt: now,
      })
    }
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()))
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem(LAST_SYNCED_KEY)
    return saved ? new Date(saved) : null
  })

  // Kiểm tra phiên đăng nhập và cô lập dữ liệu theo tài khoản khi mở ứng dụng
  useEffect(() => {
    const token = getStoredToken()

    if (!token) {
      // Nếu không có token nhưng trong máy còn lưu user_id của tài khoản trước -> Xóa sạch để bảo mật
      const cachedUserId = localStorage.getItem(CURRENT_USER_KEY)
      if (cachedUserId) {
        localStorage.removeItem(CURRENT_USER_KEY)
        localStorage.removeItem(LAST_SYNCED_KEY)
        void clearLocalData()
      }
      return
    }

    authGetMe()
      .then(async (res) => {
        const cachedUserId = localStorage.getItem(CURRENT_USER_KEY)
        const currentUserIdStr = String(res.user.id)

        // Nếu tài khoản hiện tại khác với dữ liệu đang lưu trong IndexedDB:
        // Cần làm sạch và tải đúng dữ liệu của tài khoản này từ MySQL Cloud về
        if (cachedUserId !== currentUserIdStr) {
          await clearLocalData()
          const { entries: cloudEntries } = await syncDownload()
          await populateFromCloud(cloudEntries)
          localStorage.setItem(CURRENT_USER_KEY, currentUserIdStr)
          const now = new Date()
          setLastSyncedAt(now)
          localStorage.setItem(LAST_SYNCED_KEY, now.toISOString())
        } else {
          // Cùng tài khoản: Chạy đồng bộ ngầm để cập nhật các thay đổi mới nhất từ thiết bị khác
          syncDownload()
            .then(async ({ entries: cloudEntries }) => {
              const localEntries = await db.entries.toArray()
              const localMap = new Map(localEntries.map((e) => [e.date, e]))
              const now = Date.now()
              await db.transaction('rw', db.entries, async () => {
                for (const cloud of cloudEntries) {
                  const local = localMap.get(cloud.date)
                  if (!local) {
                    await db.entries.add({
                      date: cloud.date,
                      mood: cloud.mood as Entry['mood'],
                      energy: (cloud.energy || 3) as Entry['energy'],
                      sleepHours: cloud.sleepHours,
                      tags: cloud.tags || [],
                      content: cloud.content || '',
                      createdAt: now,
                      updatedAt: now,
                    })
                  } else if (
                    local.mood !== cloud.mood ||
                    local.content !== cloud.content ||
                    (local.energy ?? 3) !== cloud.energy ||
                    (local.sleepHours ?? 8) !== cloud.sleepHours
                  ) {
                    await db.entries.update(local.id, {
                      mood: cloud.mood as Entry['mood'],
                      energy: (cloud.energy || 3) as Entry['energy'],
                      sleepHours: cloud.sleepHours,
                      tags: cloud.tags || [],
                      content: cloud.content || '',
                      updatedAt: now,
                    })
                  }
                }
              })
            })
            .catch(() => {})
        }

        setUser(res.user)
      })
      .catch(async () => {
        // Token hết hạn hoặc không hợp lệ: dọn dẹp để bảo vệ dữ liệu người dùng
        setStoredToken(null)
        setUser(null)
        localStorage.removeItem(CURRENT_USER_KEY)
        localStorage.removeItem(LAST_SYNCED_KEY)
        await clearLocalData()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Đồng bộ hai chiều (Upload bài viết local + Download bài viết Cloud)
  const syncData = useCallback(async () => {
    if (!getStoredToken()) {
      throw new Error('Bạn cần đăng nhập để đồng bộ dữ liệu')
    }

    setIsSyncing(true)
    try {
      // 1. Lấy dữ liệu bài viết local
      const localEntries = await db.entries.toArray()

      // 2. Tải toàn bộ bài viết trên Cloud của đúng tài khoản này
      const { entries: cloudEntries } = await syncDownload()

      // 3. Đẩy dữ liệu local lên Cloud (MySQL upsert theo user_id)
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

      // 4. Hợp nhất bài viết từ Cloud về local IndexedDB
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
              tags: cloud.tags || [],
              content: cloud.content || '',
              createdAt: now,
              updatedAt: now,
            })
            downloaded++
          } else if (
            local.mood !== cloud.mood ||
            local.content !== cloud.content ||
            (local.energy ?? 3) !== cloud.energy ||
            (local.sleepHours ?? 8) !== cloud.sleepHours
          ) {
            await db.entries.update(local.id, {
              mood: cloud.mood as Entry['mood'],
              energy: (cloud.energy || 3) as Entry['energy'],
              sleepHours: cloud.sleepHours,
              tags: cloud.tags || [],
              content: cloud.content || '',
              updatedAt: now,
            })
            downloaded++
          }
        }
      })

      const now = new Date()
      setLastSyncedAt(now)
      localStorage.setItem(LAST_SYNCED_KEY, now.toISOString())

      return { uploaded, downloaded }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Đăng nhập: Làm sạch dữ liệu tài khoản cũ, tải toàn bộ dữ liệu của tài khoản mới
  const login = async (email: string, pass: string) => {
    const res = await authLogin(email, pass)
    setStoredToken(res.token)

    // Xóa sạch bộ nhớ tạm local để cô lập dữ liệu
    await clearLocalData()

    // Tải toàn bộ bài viết của tài khoản này từ MySQL Cloud về
    const { entries: cloudEntries } = await syncDownload()
    await populateFromCloud(cloudEntries)

    localStorage.setItem(CURRENT_USER_KEY, String(res.user.id))
    const now = new Date()
    setLastSyncedAt(now)
    localStorage.setItem(LAST_SYNCED_KEY, now.toISOString())

    setUser(res.user)
  }

  // Đăng ký: Nếu là khách có dữ liệu cục bộ -> chuyển vào tài khoản mới. Nếu là tài khoản khác -> làm sạch.
  const register = async (email: string, pass: string) => {
    const prevUserId = localStorage.getItem(CURRENT_USER_KEY)
    const localEntriesCount = await db.entries.count()

    const res = await authRegister(email, pass)
    setStoredToken(res.token)
    localStorage.setItem(CURRENT_USER_KEY, String(res.user.id))
    setUser(res.user)

    // Nếu trước đó là khách (chưa đăng nhập tài khoản nào) và đã viết nhật ký:
    // Đẩy các bài viết của khách lên tài khoản mới tạo
    if (!prevUserId && localEntriesCount > 0) {
      await syncData().catch((err) => console.error('Initial guest upload error:', err))
    } else {
      // Nếu trước đó là tài khoản khác: Xóa sạch để tài khoản mới hoàn toàn độc lập
      await clearLocalData()
      const now = new Date()
      setLastSyncedAt(now)
      localStorage.setItem(LAST_SYNCED_KEY, now.toISOString())
    }
  }

  // Đăng xuất: Xóa sạch token, user state và toàn bộ dữ liệu cục bộ trong IndexedDB
  const logout = async () => {
    setStoredToken(null)
    setUser(null)
    setLastSyncedAt(null)
    localStorage.removeItem(LAST_SYNCED_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
    sessionStorage.removeItem('junhi_unlocked')
    await clearLocalData()
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
