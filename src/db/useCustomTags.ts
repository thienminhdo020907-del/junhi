import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

const CUSTOM_TAGS_KEY = 'customTags'

const read = async (): Promise<string[]> => {
  const row = await db.settings.get(CUSTOM_TAGS_KEY)
  return Array.isArray(row?.value) ? (row.value as string[]) : []
}

/** Danh sách cảm xúc tùy chỉnh, lưu bền trong IndexedDB (bảng settings, đi cùng bản sao lưu). */
export function useCustomTags() {
  const stored = useLiveQuery(read)

  return {
    loading: stored === undefined,
    tags: stored ?? [],
    add: async (tag: string) => {
      const cur = await read()
      await db.settings.put({ key: CUSTOM_TAGS_KEY, value: [...cur, tag] })
    },
    remove: async (tag: string) => {
      const cur = await read()
      await db.settings.put({ key: CUSTOM_TAGS_KEY, value: cur.filter((t) => t !== tag) })
    },
  }
}
