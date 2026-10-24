import { useEffect, useState } from 'react'
import { Delete, Lock, Unlock } from 'lucide-react'
import { usePinLock } from '@/db/usePinLock'

interface PinScreenProps {
  onUnlock: () => void
}

export default function PinScreen({ onUnlock }: PinScreenProps) {
  const { verifyPin } = usePinLock()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleDigit = (digit: string) => {
    if (pin.length < 6 && !isVerifying) {
      setError(false)
      const next = pin + digit
      setPin(next)
      if (next.length >= 4) {
        checkPin(next)
      }
    }
  }

  const handleDelete = () => {
    if (!isVerifying && pin.length > 0) {
      setError(false)
      setPin(pin.slice(0, -1))
    }
  }

  const checkPin = async (candidate: string) => {
    setIsVerifying(true)
    const valid = await verifyPin(candidate)
    if (valid) {
      onUnlock()
    } else {
      if (candidate.length >= 4) {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
          setIsVerifying(false)
        }, 500)
      } else {
        setIsVerifying(false)
      }
    }
  }

  // Lắng nghe phím vật lý
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/95 p-4 backdrop-blur-xl">
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
          <Lock size={28} />
        </div>

        <h2 className="text-xl font-bold text-[var(--text)]">Nhật ký đang khóa</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Nhập mã PIN để mở khóa ứng dụng</p>

        {/* Các chấm hiển thị mã PIN */}
        <div
          className={`my-7 flex items-center justify-center gap-3.5 transition-transform ${
            error ? 'animate-bounce text-[var(--danger)]' : ''
          }`}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`size-3.5 rounded-full border transition-all ${
                i < pin.length
                  ? error
                    ? 'border-[var(--danger)] bg-[var(--danger)]'
                    : 'border-[var(--accent)] bg-[var(--accent)] scale-110 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-xs font-medium text-[var(--danger)]">Mã PIN không chính xác</p>}

        {/* Bàn phím số */}
        <div className="grid w-full grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xl font-semibold text-[var(--text)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] active:scale-90"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xl font-semibold text-[var(--text)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] active:scale-90"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Xóa"
            className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] transition-all hover:text-[var(--text)] hover:border-[var(--border-strong)] active:scale-90"
          >
            <Delete size={20} />
          </button>
        </div>

        {pin.length >= 4 && (
          <button
            type="button"
            onClick={() => checkPin(pin)}
            className="mt-6 flex items-center gap-1.5 text-xs text-[var(--accent)] underline"
          >
            <Unlock size={13} /> Nhấn để mở khóa
          </button>
        )}
      </div>
    </div>
  )
}
