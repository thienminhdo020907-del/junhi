import { lazy, Suspense } from 'react'
import TodayPage from '@/pages/TodayPage'
import { ROUTES } from '@/constants/app'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import CalendarPage from '@/pages/CalendarPage'
import JournalPage from '@/pages/JournalPage'
import SettingsPage from '@/pages/SettingsPage'

// recharts khá nặng nên chỉ tải khi vào tab Thống kê
const StatsPage = lazy(() => import('@/pages/StatsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path={ROUTES.calendar} element={<CalendarPage />} />
          <Route path={ROUTES.journal} element={<JournalPage />} />
          <Route
            path={ROUTES.stats}
            element={
              <Suspense fallback={null}>
                <StatsPage />
              </Suspense>
            }
          />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
