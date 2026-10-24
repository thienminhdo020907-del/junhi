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
      <div className="card w-full max-w-sm !p-6 shadow-2xl bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[var(--text)]">
            <Cloud size={22} className="text-[var(--accent)]" />
            <h2 className="text-base font-semibold">
              {mode === 'login' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-xl p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-5 text-xs text-[var(--text-muted)] leading-relaxed">
          Đăng nhập để đồng bộ nhật ký giữa các thiết bị và nhận email nhắc nhở mỗi ngày.
        </p>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-[var(--surface-2)] p-1 text-xs font-semibold border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`rounded-lg py-1.5 transition-all ${
              mode === 'login'
                ? 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
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
                ? 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text)]">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pr-3 pl-9 text-xs text-[var(--text)] placeholder:text-[var(--placeholder)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text)]">
              Mật khẩu {mode === 'register' && '(tối thiểu 6 ký tự)'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pr-3 pl-9 text-xs text-[var(--text)] placeholder:text-[var(--placeholder)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-2.5 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
              <Check size={14} />
              {mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!'}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] py-2.5 text-xs font-semibold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
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
