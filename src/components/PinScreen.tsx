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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl">
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30">
          <Lock size={28} />
        </div>

        <h2 className="text-xl font-bold text-white">Nhật ký đang khóa</h2>
        <p className="mt-1 text-xs text-slate-400">Nhập mã PIN để mở khóa ứng dụng</p>

        {/* Các chấm hiển thị mã PIN */}
        <div
          className={`my-7 flex items-center justify-center gap-3.5 transition-transform ${
            error ? 'animate-bounce text-red-400' : ''
          }`}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`size-3.5 rounded-full border transition-all ${
                i < pin.length
                  ? error
                    ? 'border-red-500 bg-red-500'
                    : 'border-brand-400 bg-brand-400 scale-110 shadow-sm shadow-brand-400/50'
                  : 'border-white/20 bg-white/5'
              }`}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-xs font-medium text-red-400">Mã PIN không chính xác</p>}

        {/* Bàn phím số */}
        <div className="grid w-full grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white transition-all hover:bg-white/15 active:scale-90"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex aspect-square items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white transition-all hover:bg-white/15 active:scale-90"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Xóa"
            className="flex aspect-square items-center justify-center rounded-2xl bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-90"
          >
            <Delete size={20} />
          </button>
        </div>

        {pin.length >= 4 && (
          <button
            type="button"
            onClick={() => checkPin(pin)}
            className="mt-6 flex items-center gap-1.5 text-xs text-brand-300 underline"
          >
            <Unlock size={13} /> Nhấn để mở khóa
          </button>
        )}
      </div>
    </div>
  )
}
