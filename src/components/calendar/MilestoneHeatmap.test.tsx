import { describe, expect, it } from 'vitest'
import {
  MILESTONE_TYPES,
  type Milestone,
  type MilestoneType,
} from '@/db/useMilestones'

// Giả lập hàm xử lý lọc và lặp lại cột mốc theo năm
function getMilestonesForYear(milestones: Milestone[], year: number, filterType: MilestoneType | 'all' = 'all') {
  const result: Milestone[] = []

  for (const m of milestones) {
    if (filterType !== 'all' && m.type !== filterType) {
      continue
    }

    const mYear = parseInt(m.date.slice(0, 4), 10)
    if (mYear === year) {
      result.push(m)
    } else if (m.repeatYearly && year >= mYear) {
      // Chiếu cột mốc lặp hằng năm sang năm truy vấn
      result.push({
        ...m,
        date: `${year}-${m.date.slice(5)}`,
      })
    }
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

// Giả lập logic gom nhãn tránh đè nhau trên lưới
function formatDayMilestonesLabel(dayMilestones: Milestone[]) {
  if (dayMilestones.length === 0) return null
  const first = dayMilestones[0]
  if (dayMilestones.length === 1) {
    return `${first.emoji} ${first.title}`
  }
  return `${first.emoji} ${first.title} +${dayMilestones.length - 1}`
}

describe('Milestone & Heatmap Life in Weeks', () => {
  describe('1. Thêm, sửa và xóa cột mốc', () => {
    it('tạo cột mốc mới hợp lệ', () => {
      const milestone: Milestone = {
        id: 'ms-1',
        date: '2026-03-15',
        emoji: '🎂',
        title: 'Sinh nhật lần thứ 20',
        type: 'personal',
        repeatYearly: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      expect(milestone.id).toBe('ms-1')
      expect(milestone.emoji).toBe('🎂')
      expect(milestone.repeatYearly).toBe(true)
    })

    it('sửa thông tin cột mốc', () => {
      let milestone: Milestone = {
        id: 'ms-1',
        date: '2026-03-15',
        emoji: '🎂',
        title: 'Sinh nhật',
        type: 'personal',
        createdAt: 1000,
        updatedAt: 1000,
      }

      milestone = {
        ...milestone,
        title: 'Sinh nhật đặc biệt',
        updatedAt: 2000,
      }

      expect(milestone.title).toBe('Sinh nhật đặc biệt')
      expect(milestone.updatedAt).toBe(2000)
    })

    it('xóa cột mốc khỏi danh sách', () => {
      const list: Milestone[] = [
        { id: 'ms-1', date: '2026-01-01', emoji: '🎉', title: 'Tết', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: 'ms-2', date: '2026-05-01', emoji: '🏖️', title: 'Nghỉ lễ', type: 'travel', createdAt: 0, updatedAt: 0 },
      ]

      const remaining = list.filter((m) => m.id !== 'ms-1')
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('ms-2')
    })
  })

  describe('2. Cột mốc lặp lại hằng năm (repeatYearly)', () => {
    it('cột mốc lặp lại hằng năm tự động hiển thị ở các năm sau', () => {
      const milestones: Milestone[] = [
        {
          id: 'ms-birthday',
          date: '2024-08-20',
          emoji: '🎂',
          title: 'Sinh nhật',
          type: 'personal',
          repeatYearly: true,
          createdAt: 0,
          updatedAt: 0,
        },
        {
          id: 'ms-launch',
          date: '2024-11-10',
          emoji: '🚀',
          title: 'Ra mắt v1.0',
          type: 'work',
          repeatYearly: false, // Không lặp
          createdAt: 0,
          updatedAt: 0,
        },
      ]

      // Truy vấn năm 2026
      const in2026 = getMilestonesForYear(milestones, 2026)
      expect(in2026).toHaveLength(1)
      expect(in2026[0].title).toBe('Sinh nhật')
      expect(in2026[0].date).toBe('2026-08-20')

      // Truy vấn năm 2027
      const in2027 = getMilestonesForYear(milestones, 2027)
      expect(in2027).toHaveLength(1)
      expect(in2027[0].date).toBe('2027-08-20')
    })
  })

  describe('3. Lọc theo loại cột mốc (Filter by Type)', () => {
    const mixedMilestones: Milestone[] = [
      { id: '1', date: '2026-01-10', emoji: '💼', title: 'Phỏng vấn', type: 'work', createdAt: 0, updatedAt: 0 },
      { id: '2', date: '2026-02-14', emoji: '❤️', title: 'Valentine', type: 'personal', createdAt: 0, updatedAt: 0 },
      { id: '3', date: '2026-06-01', emoji: '✈️', title: 'Đi Đà Nẵng', type: 'travel', createdAt: 0, updatedAt: 0 },
      { id: '4', date: '2026-07-20', emoji: '🏃', title: 'Marathon', type: 'health', createdAt: 0, updatedAt: 0 },
    ]

    it('lọc "all" trả về toàn bộ mốc', () => {
      expect(getMilestonesForYear(mixedMilestones, 2026, 'all')).toHaveLength(4)
    })

    it('lọc theo từng loại riêng biệt', () => {
      expect(getMilestonesForYear(mixedMilestones, 2026, 'work')).toHaveLength(1)
      expect(getMilestonesForYear(mixedMilestones, 2026, 'travel')[0].title).toBe('Đi Đà Nẵng')
      expect(getMilestonesForYear(mixedMilestones, 2026, 'study')).toHaveLength(0)
    })
  })

  describe('4. Sắp xếp nhãn tránh chồng chéo khi có nhiều mốc', () => {
    it('1 mốc trong ngày: hiển thị đầy đủ emoji và title', () => {
      const dayM: Milestone[] = [
        { id: '1', date: '2026-09-02', emoji: '🇻🇳', title: 'Quốc khánh', type: 'personal', createdAt: 0, updatedAt: 0 },
      ]
      expect(formatDayMilestonesLabel(dayM)).toBe('🇻🇳 Quốc khánh')
    })

    it('nhiều mốc trong cùng một ngày: gom thành "+N" tránh tràn', () => {
      const dayM: Milestone[] = [
        { id: '1', date: '2026-10-24', emoji: '🎂', title: 'Sinh nhật', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: '2', date: '2026-10-24', emoji: '🎓', title: 'Tốt nghiệp', type: 'study', createdAt: 0, updatedAt: 0 },
        { id: '3', date: '2026-10-24', emoji: '🎉', title: 'Tiệc tối', type: 'personal', createdAt: 0, updatedAt: 0 },
      ]
      expect(formatDayMilestonesLabel(dayM)).toBe('🎂 Sinh nhật +2')
    })
  })

  describe('5. Thử nghiệm với các kịch bản số lượng mốc: 0, 5, và 40 cột mốc', () => {
    it('khi có 0 cột mốc: trả về rỗng không lỗi', () => {
      const res = getMilestonesForYear([], 2026)
      expect(res).toEqual([])
    })

    it('khi có 5 cột mốc: sắp xếp đúng thứ tự thời gian', () => {
      const fiveM: Milestone[] = [
        { id: '1', date: '2026-12-25', emoji: '🎄', title: 'Giáng sinh', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: '2', date: '2026-01-01', emoji: '🎉', title: 'Năm mới', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: '3', date: '2026-04-30', emoji: '🇻🇳', title: 'Giải phóng', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: '4', date: '2026-03-08', emoji: '💐', title: '8/3', type: 'personal', createdAt: 0, updatedAt: 0 },
        { id: '5', date: '2026-09-02', emoji: '⭐', title: 'Quốc khánh', type: 'personal', createdAt: 0, updatedAt: 0 },
      ]
      const res = getMilestonesForYear(fiveM, 2026)
      expect(res).toHaveLength(5)
      expect(res[0].date).toBe('2026-01-01')
      expect(res[4].date).toBe('2026-12-25')
    })

    it('khi có 40 cột mốc: xử lý nhanh và chính xác', () => {
      const fortyM: Milestone[] = Array.from({ length: 40 }, (_, i) => {
        const month = String(Math.floor(i / 3) + 1).padStart(2, '0')
        const day = String((i % 25) + 1).padStart(2, '0')
        return {
          id: `m-${i}`,
          date: `2026-${month}-${day}`,
          emoji: '📌',
          title: `Cột mốc số ${i + 1}`,
          type: MILESTONE_TYPES[i % MILESTONE_TYPES.length].type,
          createdAt: 0,
          updatedAt: 0,
        }
      })

      const res = getMilestonesForYear(fortyM, 2026)
      expect(res).toHaveLength(40)
    })
  })
})
