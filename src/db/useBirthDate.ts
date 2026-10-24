import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

const BIRTH_KEY = 'birthDate'

/** Ngày sinh (YYYY-MM-DD) lưu trong bảng settings. loading = true khi đang đọc. */
export function useBirthDate() {
  const result = useLiveQuery(async () => {
    const row = await db.settings.get(BIRTH_KEY)
    return { value: row?.value as string | undefined }
  })

  return {
    loading: result === undefined,
    birthDate: result?.value,
    setBirthDate: (value: string) => db.settings.put({ key: BIRTH_KEY, value }),
  }
}
