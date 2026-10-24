import { useState } from 'react'
import { KeyRound, ShieldAlert, X } from 'lucide-react'
import { usePinLock } from '@/db/usePinLock'

interface PinSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PinSetupModal({ isOpen, onClose, onSuccess }: PinSetupModalProps) {
  const { setPin } = usePinLock()
  const [pin, setPinValue] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleDigit = (digit: string) => {
    setError('')
    if (step === 'create') {
      if (pin.length < 4) {
        const next = pin + digit
        setPinValue(next)
        if (next.length === 4) {
          setTimeout(() => setStep('confirm'), 200)
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + digit
        setConfirmPin(next)
        if (next.length === 4) {
          if (next === pin) {
            setPin(next).then(() => {
              onSuccess()
              handleClose()
            })
          } else {
            setError('Mã xác nhận không khớp. Vui lòng nhập lại.')
            setTimeout(() => {
              setConfirmPin('')
              setError('')
            }, 1000)
          }
        }
      }
    }
  }

  const handleDelete = () => {
    setError('')
    if (step === 'create') {
      setPinValue((p) => p.slice(0, -1))
    } else {
      setConfirmPin((p) => p.slice(0, -1))
    }
  }

  const handleClose = () => {
    setPinValue('')
    setConfirmPin('')
    setStep('create')
    setError('')
    onClose()
  }

  const activeLen = step === 'create' ? pin.length : confirmPin.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="card w-full max-w-xs !p-6 text-center shadow-2xl bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[var(--text)]">
            <KeyRound size={20} className="text-[var(--accent)]" />
            <span className="text-base">Thiết lập mã PIN</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng"
            className="rounded-xl p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          {step === 'create'
            ? 'Nhập 4 chữ số cho mã PIN bảo vệ:'
            : 'Nhập lại mã PIN để xác nhận:'}
        </p>

        {/* Chấm hiển thị mã */}
        <div className="my-6 flex items-center justify-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`size-3.5 rounded-full border transition-all ${
                i < activeLen
                  ? 'border-[var(--accent)] bg-[var(--accent)] scale-110 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--danger)]">
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Bàn phím số */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(n)}
              className="flex aspect-square items-center justify-center rounded-xl bg-[var(--surface-2)] text-lg font-bold text-[var(--text)] border border-[var(--border)] transition-all hover:border-[var(--border-strong)] active:scale-95"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex aspect-square items-center justify-center rounded-xl bg-[var(--surface-2)] text-lg font-bold text-[var(--text)] border border-[var(--border)] transition-all hover:border-[var(--border-strong)] active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Xóa ký tự"
            className="flex aspect-square items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] transition-all hover:text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95"
          >
            ←
          </button>
        </div>

        {step === 'confirm' && (
          <button
            type="button"
            onClick={() => {
              setStep('create')
              setPinValue('')
              setConfirmPin('')
              setError('')
            }}
            className="mt-4 text-xs text-[var(--accent)] underline"
          >
            Quay lại bước trước
          </button>
        )}
      </div>
    </div>
  )
}
