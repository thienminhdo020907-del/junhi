import { useState } from 'react'
import { Check, Cloud, Lock, Mail, UserCheck, X } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="card w-full max-w-sm !p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-300">
            <Cloud size={22} />
            <h2 className="text-base font-semibold">
              {mode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-xl p-1 text-slate-400 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
          Đăng nhập để đồng bộ nhật ký giữa các thiết bị và nhận email nhắc nhở mỗi ngày.
        </p>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold dark:bg-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`rounded-lg py-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-brand-600 shadow-sm dark:bg-[#2b2845] dark:text-brand-100'
                : 'text-slate-500 dark:text-slate-400'
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
            className={`rounded-lg py-1.5 transition-all ${
              mode === 'register'
                ? 'bg-white text-brand-600 shadow-sm dark:bg-[#2b2845] dark:text-brand-100'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                className="w-full rounded-xl border border-brand-200 bg-white py-2 pr-3 pl-9 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Mật khẩu {mode === 'register' && '(tối thiểu 6 ký tự)'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-200 bg-white py-2 pr-3 pl-9 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check size={14} />
              {mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!'}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              'Đang xử lý...'
            ) : mode === 'login' ? (
              <>
                <UserCheck size={15} /> Đăng nhập
              </>
            ) : (
              <>
                <Cloud size={15} /> Tạo tài khoản & Bắt đầu đồng bộ
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
