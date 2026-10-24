import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Milestone, type MilestoneType } from './db'

export type { Milestone, MilestoneType }

export const MILESTONE_TYPES: {
  type: MilestoneType
  label: string
  color: string
  bgColor: string
}[] = [
  { type: 'personal', label: 'Cá nhân', color: '#E11D48', bgColor: 'rgba(225, 29, 72, 0.12)' },
  { type: 'work', label: 'Công việc', color: '#2563EB', bgColor: 'rgba(37, 99, 235, 0.12)' },
  { type: 'health', label: 'Sức khỏe', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.12)' },
  { type: 'travel', label: 'Du lịch', color: '#D97706', bgColor: 'rgba(217, 119, 6, 0.12)' },
  { type: 'study', label: 'Học tập', color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.12)' },
  { type: 'other', label: 'Khác', color: '#4B5563', bgColor: 'rgba(75, 85, 99, 0.12)' },
]

export const POPULAR_EMOJIS = [
  '🎂', '🚀', '🎓', '💍', '✈️', '💼', '🏆', '❤️',
  '🌟', '🏠', '👶', '🎉', '🏃', '🩺', '🌿', '☕',
  '🐱', '🐶', '🎨', '🎵', '🚗', '🏔️', '📚', '💡'
]

/** Lấy cột mốc của một năm cụ thể (bao gồm cả các mốc lặp lại hằng năm) */
export function useMilestones(year?: number) {
  const allMilestones = useLiveQuery(() => db.milestones.toArray(), [])

  const milestones = (allMilestones || []).flatMap((m) => {
    if (!year) return [m]

    const mYear = parseInt(m.date.slice(0, 4), 10)
    // Cột mốc trong chính năm đó
    if (mYear === year) return [m]

    // Cột mốc lặp lại hằng năm: hiển thị ở năm được chọn nếu năm đó >= năm tạo
    if (m.repeatYearly) {
      const projectedDate = `${year}-${m.date.slice(5)}`
      return [
        {
          ...m,
          date: projectedDate,
          originalDate: m.date,
        },
      ]
    }

    return []
  })

  // Sắp xếp theo ngày tăng dần
  milestones.sort((a, b) => a.date.localeCompare(b.date))

  const addMilestone = useCallback(
    async (data: {
      date: string
      emoji: string
      title: string
      type: MilestoneType
      note?: string
      repeatYearly?: boolean
    }) => {
      const now = Date.now()
      const newMilestone: Milestone = {
        id: `ms-${now}-${Math.random().toString(36).slice(2, 7)}`,
        date: data.date,
        emoji: data.emoji || '🌟',
        title: data.title.trim().slice(0, 40),
        type: data.type || 'personal',
        note: data.note?.trim() || '',
        repeatYearly: !!data.repeatYearly,
        createdAt: now,
        updatedAt: now,
      }
      await db.milestones.put(newMilestone)
      return newMilestone
    },
    [],
  )

  const updateMilestone = useCallback(
    async (
      id: string,
      data: Partial<Omit<Milestone, 'id' | 'createdAt'>>,
    ) => {
      const existing = await db.milestones.get(id)
      if (!existing) return
      await db.milestones.update(id, {
        ...data,
        updatedAt: Date.now(),
      })
    },
    [],
  )

  const deleteMilestone = useCallback(async (id: string) => {
    await db.milestones.delete(id)
  }, [])

  return {
    milestones,
    allMilestones: allMilestones || [],
    addMilestone,
    updateMilestone,
    deleteMilestone,
  }
}
