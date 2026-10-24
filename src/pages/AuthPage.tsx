import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Cloud,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { APP_NAME, ROUTES } from '@/constants/app'
import { useAuth } from '@/context/useAuth'

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ROUTES.today

  const isRegisterRoute = location.pathname.includes('register')
  const mode: 'login' | 'register' = isRegisterRoute ? 'register' : 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Nếu đã đăng nhập thì tự động chuyển hướng
  useEffect(() => {
    if (user && !successMsg) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, redirectTo, successMsg])

  // Đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200 dark:bg-white/10' }
    if (pass.length < 6) return { score: 1, text: 'Quá ngắn', color: 'bg-rose-500' }
    const hasNumber = /\d/.test(pass)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    if (pass.length >= 8 && hasNumber && hasSpecial) {
      return { score: 3, text: 'Rất mạnh', color: 'bg-emerald-500' }
    }
    if (pass.length >= 6 && (hasNumber || hasSpecial)) {
      return { score: 2, text: 'Tốt', color: 'bg-amber-500' }
    }
    return { score: 1, text: 'Khá yếu', color: 'bg-amber-400' }
  }

  const strength = getPasswordStrength(password)

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
        setSuccessMsg('Chào mừng bạn đến với Junhi! Đang chuẩn bị không gian cho bạn...')
      }

      setTimeout(() => {
        navigate(redirectTo, { replace: true })
      }, 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-[#0f0e17] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* CỘT TRÁI: FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-1/2 lg:p-14 xl:p-18">
        <div>
          {/* Header thanh điều hướng nhỏ */}
          <div className="flex items-center justify-between">
            <Link
              to={ROUTES.today}
              className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Về trang chủ</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                MySQL Cloud Connected
              </span>
            </div>
          </div>

          {/* Form Content Container */}
          <div className="mx-auto mt-10 max-w-sm sm:mt-14">
            {/* Logo Thương hiệu */}
            <div className="mb-6 flex items-center gap-3">
              <img src="/favicon.svg" alt="Junhi" className="size-11 rounded-2xl shadow-sm" />
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {APP_NAME}
                </span>
                <span className="ml-2 rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  Cloud Sync
                </span>
              </div>
            </div>

            {/* Tiêu đề & Lời chào */}
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {mode === 'login' ? 'Đăng nhập tài khoản' : 'Khởi tạo tài khoản mới'}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {mode === 'login'
                ? 'Chào mừng bạn quay lại! Nhập thông tin để tiếp tục hành trình nuôi dưỡng cảm xúc.'
                : 'Bắt đầu thói quen check-in tâm trạng và bảo vệ dữ liệu trên đám mây miễn phí.'}
            </p>

            {/* Tab chuyển đổi Đăng nhập / Đăng ký kiểu Pill quốc tế */}
            <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold dark:bg-white/10">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  navigate(
                    redirectTo === ROUTES.today ? ROUTES.login : `${ROUTES.login}?redirect=${redirectTo}`,
                    { replace: true },
                  )
                }}
                className={`rounded-xl py-2 transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-[#201d33] dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  navigate(
                    redirectTo === ROUTES.today
                      ? ROUTES.register
                      : `${ROUTES.register}?redirect=${redirectTo}`,
                    { replace: true },
                  )
                }}
                className={`rounded-xl py-2 transition-all ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-[#201d33] dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Tạo tài khoản
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-brand-500"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5 dark:focus:border-brand-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Tính năng đặt lại mật khẩu: Bạn có thể liên hệ quản trị viên hoặc tạo tài khoản mới nếu chưa lưu dữ liệu quan trọng.',
                        )
                      }
                      className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-brand-500"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5 dark:focus:border-brand-400"
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

                {/* Thanh đo độ mạnh mật khẩu khi Đăng ký */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.score >= 1 ? strength.color : 'opacity-0'
                        }`}
                        style={{ width: '33.33%' }}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.score >= 2 ? strength.color : 'opacity-0'
                        }`}
                        style={{ width: '33.33%' }}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength.score >= 3 ? strength.color : 'opacity-0'
                        }`}
                        style={{ width: '33.34%' }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Độ mạnh mật khẩu:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {strength.text}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Checkbox Ghi nhớ */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-white/20 dark:bg-white/10"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Ghi nhớ phiên đăng nhập (30 ngày)
                  </span>
                </label>
              </div>

              {/* Thông báo lỗi */}
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Thông báo thành công */}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
                  <Check size={16} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Nút Submit chính */}
              <button
                type="submit"
                disabled={loading || Boolean(successMsg)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : mode === 'login' ? (
                  <>
                    <UserCheck size={17} /> Đăng nhập ngay
                  </>
                ) : (
                  <>
                    <Cloud size={17} /> Đăng ký & Bắt đầu đồng bộ
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/80 pt-5 text-center dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login' ? 'Chưa có tài khoản Junhi?' : 'Đã có tài khoản từ trước?'}
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === 'login' ? 'register' : 'login'
                    setError(null)
                    navigate(
                      nextMode === 'login'
                        ? redirectTo === ROUTES.today
                          ? ROUTES.login
                          : `${ROUTES.login}?redirect=${redirectTo}`
                        : redirectTo === ROUTES.today
                          ? ROUTES.register
                          : `${ROUTES.register}?redirect=${redirectTo}`,
                      { replace: true },
                    )
                  }}
                  className="ml-1.5 font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  {mode === 'login' ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer bản quyền */}
        <div className="mt-10 text-center text-[11px] text-slate-400">
          <p>© 2026 {APP_NAME} Mood Journal. Quyền riêng tư & dữ liệu được bảo vệ an toàn.</p>
        </div>
      </div>

      {/* CỘT PHẢI: SHOWCASE BRANDING & NGHỆ THUẬT QUỐC TẾ */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#0f172a] p-12 text-white lg:flex xl:p-16">
        {/* Họa tiết ánh sáng & Gradient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Header góc phải */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-brand-300" /> Bản phát hành Quốc tế v2.0
          </span>
          <span className="text-xs text-slate-400">Thiết kế cho Tâm trí & Sự an yên</span>
        </div>

        {/* Nội dung trung tâm Showcase */}
        <div className="relative z-10 max-w-lg space-y-6">
          <blockquote className="text-2xl font-bold leading-snug tracking-tight xl:text-3xl">
            “Thấu hiểu cảm xúc mỗi ngày chính là chìa khóa để nuôi dưỡng một tâm hồn an yên và tràn đầy
            năng lượng sống.”
          </blockquote>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-violet-500/30 text-violet-300">
                <Moon size={18} />
              </div>
              <h2 className="text-sm font-bold">Hiểu giấc ngủ của bạn</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Kéo hai núm trăng và mặt trời, thấy ngay hôm qua bạn ngủ đủ hay thiếu. Sau vài tuần, bạn sẽ biết giờ ngủ nào giúp mình tỉnh táo nhất.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-emerald-500/30 text-emerald-300">
                <TrendingUp size={18} />
              </div>
              <h2 className="text-sm font-bold">Nhìn lại cảm xúc theo năm tháng</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Mỗi ngày một ô màu. Cuối năm, bạn có cả bức tranh: tháng nào vui, tuần nào nặng nề, và điều gì thường kéo tâm trạng lên.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-brand-500/30 text-brand-300">
                <Cloud size={18} />
              </div>
              <h2 className="text-sm font-bold">Luôn ở bên bạn, trên mọi thiết bị</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Viết trên máy tính buổi tối, đọc lại trên điện thoại sáng hôm sau. Nhật ký của bạn luôn sẵn sàng, không lo mất.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10">
              <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-amber-500/30 text-amber-300">
                <ShieldCheck size={18} />
              </div>
              <h2 className="text-sm font-bold">Chỉ mình bạn đọc được</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Nhật ký là chuyện riêng tư. Khóa bằng mã PIN, không ai khác mở được, kể cả khi người khác cầm máy bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Footer góc phải với Badge uy tín */}
        <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-300">
          <div className="flex -space-x-2">
            {['😊', '✨', '🌙', '💜'].map((emoji, idx) => (
              <div
                key={idx}
                className="flex size-7 items-center justify-center rounded-full bg-white/20 text-xs ring-2 ring-[#1e1b4b]"
              >
                {emoji}
              </div>
            ))}
          </div>
          <p>
            Tham gia cùng hàng nghìn người theo dõi mood & chăm sóc bản thân mỗi ngày cùng {APP_NAME}.
          </p>
        </div>
      </div>
    </div>
  )
}
