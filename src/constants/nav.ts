import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Settings,
  SunMedium,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from './app'

export interface NavItem {
  id: string
  to: string
  label: string
  icon: LucideIcon
}

/** Các mục điều hướng dùng chung cho Sidebar (desktop/tablet) và BottomNav (điện thoại). */
export const NAV_ITEMS: NavItem[] = [
  { id: 'hom-nay', to: ROUTES.today, label: 'Hôm nay', icon: SunMedium },
  { id: 'lich', to: ROUTES.calendar, label: 'Lịch', icon: CalendarDays },
  { id: 'nhat-ky', to: ROUTES.journal, label: 'Nhật ký', icon: BookOpen },
  { id: 'thong-ke', to: ROUTES.stats, label: 'Thống kê', icon: BarChart3 },
  { id: 'cai-dat', to: ROUTES.settings, label: 'Cài đặt', icon: Settings },
]
