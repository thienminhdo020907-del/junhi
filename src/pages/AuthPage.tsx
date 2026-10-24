import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Cloud, Eye, EyeOff, Lock, Mail, Sparkles, UserCheck } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Xác định tab mặc định dựa trên URL (nếu /auth/register thì mở tab đăng ký)
  const isRegisterInitial = location.pathname.includes('register')
  const [mode, setMode] = useState<'login' | 'register'>(isRegisterInitial ? 'register' : 'login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Nếu đã đăng nhập thì tự động chuyển về trang chủ
  useEffect(() => {
    if (user && !successMsg) {
      navigate(ROUTES.today, { replace: true })
    }
  }, [user, navigate, successMsg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...')
      } else {
        await register(email, password)
        setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...')
      }

      setTimeout(() => {
        navigate(ROUTES.today, { replace: true })
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 bg-radial from-brand-500/10 via-transparent to-transparent">
      {/* Nút quay lại trang chủ */}
      <div className="w-full max-w-md mb-4">
        <Link
          to={ROUTES.today}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
      </div>

      <div className="card w-full max-w-md !p-8 shadow-2xl relative overflow-hidden">
        {/* Họa tiết trang trí */}
        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />

        {/* Logo & Tiêu đề */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 ring-1 ring-brand-500/20 dark:bg-brand-400/20 dark:text-brand-300 shadow-sm">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {mode === 'login' ? `Chào mừng trở lại ${APP_NAME}` : `Tạo tài khoản ${APP_NAME}`}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {mode === 'login'
              ? 'Đăng nhập để đồng bộ nhật ký và cảm xúc của bạn giữa mọi thiết bị'
              : 'Bắt đầu hành trình thấu hiểu cảm xúc và chăm sóc sức khỏe tinh thần'}
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-xs font-bold dark:bg-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`rounded-xl py-2 transition-all ${
              mode === 'login'
                ? 'bg-white text-brand-600 shadow-sm dark:bg-[#2b2845] dark:text-brand-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`rounded-xl py-2 transition-all ${
              mode === 'register'
                ? 'bg-white text-brand-600 shadow-sm dark:bg-[#2b2845] dark:text-brand-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Tạo tài khoản mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                className="w-full rounded-xl border border-brand-200 bg-white/70 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5 dark:focus:bg-white/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu {mode === 'register' && '(tối thiểu 6 ký tự)'}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-200 bg-white/70 py-2.5 pr-10 pl-10 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5 dark:focus:bg-white/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
              <Check size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || Boolean(successMsg)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              'Đang xử lý...'
            ) : mode === 'login' ? (
              <>
                <UserCheck size={16} /> Đăng nhập
              </>
            ) : (
              <>
                <Cloud size={16} /> Tạo tài khoản & Đồng bộ ngay
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Dữ liệu của bạn luôn được mã hóa an toàn và đồng bộ hóa với cơ sở dữ liệu MySQL cá nhân.
        </p>
      </div>
    </div>
  )
}
