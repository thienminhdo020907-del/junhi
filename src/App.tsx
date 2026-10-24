import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { ROUTES } from '@/constants/app'
import AuthPage from '@/pages/AuthPage'
import CalendarPage from '@/pages/CalendarPage'
import JournalPage from '@/pages/JournalPage'
import SettingsPage from '@/pages/SettingsPage'
import TodayPage from '@/pages/TodayPage'

// recharts khá nặng nên chỉ tải khi vào tab Thống kê
const StatsPage = lazy(() => import('@/pages/StatsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          {/* Trang Đăng nhập / Đăng ký riêng biệt */}
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />

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
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
