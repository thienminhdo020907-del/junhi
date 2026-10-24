import Dexie, { type EntityTable } from 'dexie'
import type { Mood } from '@/lib/mood'

export type Energy = 1 | 2 | 3 | 4 | 5

/** Dữ liệu của một ngày. Mỗi ngày tối đa một entry (chỉ mục `date` là duy nhất). */
export interface Entry {
  id: number
  /** Ngày dạng YYYY-MM-DD (giờ địa phương) */
  date: string
  /** Tâm trạng 1 (rất tệ) đến 5 (rất tốt) */
  mood: Mood
  /** Các tag cảm xúc, ví dụ 'Vui vẻ', 'Lo lắng' */
  tags: string[]
  /** Năng lượng 1 (cạn kiệt) đến 5 (tràn đầy); null nếu chưa nhập */
  energy: Energy | null
  /** Số giờ ngủ đêm trước (0–24, bước 0.5); null nếu chưa nhập */
  sleepHours: number | null
  /** Ghi chú / nhật ký dài */
  content: string
  createdAt: number
  updatedAt: number
}

/** Dữ liệu người dùng nhập, chưa có id và mốc thời gian. */
export type EntryInput = Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>

export interface Setting {
  key: string
  value: unknown
}

export type MilestoneType = 'personal' | 'work' | 'health' | 'travel' | 'study' | 'other'

export interface Milestone {
  id: string
  date: string // YYYY-MM-DD
  emoji: string
  title: string
  type: MilestoneType
  note?: string
  repeatYearly?: boolean
  createdAt: number
  updatedAt: number
}

class JunhiDB extends Dexie {
  entries!: EntityTable<Entry, 'id'>
  settings!: EntityTable<Setting, 'key'>
  milestones!: EntityTable<Milestone, 'id'>

  constructor() {
    super('junhi')
    this.version(1).stores({
      entries: '++id, &date, mood, updatedAt',
      settings: 'key',
    })
    this.version(2)
      .stores({
        entries: '++id, &date, mood, updatedAt, *tags',
        settings: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('entries')
          .toCollection()
          .modify((e) => {
            e.tags ??= []
            e.energy ??= null
            e.sleepHours ??= null
          }),
      )
    this.version(3).stores({
      entries: '++id, &date, mood, updatedAt, *tags',
      settings: 'key',
      milestones: 'id, date, type, repeatYearly, createdAt',
    })
  }
}

export const db = new JunhiDB()
