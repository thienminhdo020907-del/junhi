import { useEffect, useState } from 'react'
import { Keyboard, X } from 'lucide-react'

export default function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tránh bắt phím khi đang nhập liệu
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setIsOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleCustomOpen = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-shortcuts-modal', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-shortcuts-modal', handleCustomOpen)
    }
  }, [])

  if (!isOpen) return null

  const shortcuts = [
    { key: 'N', desc: 'Chuyển nhanh đến trang Hôm nay (Now)' },
    { key: 'T', desc: 'Xem Lịch theo Ngày (Today)' },
    { key: 'W', desc: 'Xem Lịch theo Tuần (Week)' },
    { key: 'M', desc: 'Xem Lịch theo Tháng (Month)' },
    { key: 'Y', desc: 'Xem Lịch theo Năm (Year)' },
    { key: '← / →', desc: 'Chuyển kỳ trước / sau trong Lịch' },
    { key: '?', desc: 'Bật / tắt bảng phím tắt này' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="card w-full max-w-sm !p-6 shadow-2xl bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)]">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2 font-bold text-[var(--text)]">
            <Keyboard size={20} className="text-[var(--accent)]" />
            <h2 className="text-base">Phím tắt bàn phím</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
            className="rounded-xl p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="space-y-2.5 text-xs">
          {shortcuts.map((s) => (
            <li key={s.key} className="flex items-center justify-between">
              <span className="text-[var(--text)]">{s.desc}</span>
              <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[11px] font-bold text-[var(--text)] shadow-xs">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-[11px] text-[var(--text-muted)]">
          Bấm <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[10px] text-[var(--text)]">Esc</kbd> hoặc <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[10px] text-[var(--text)]">?</kbd> để đóng
        </p>
      </div>
    </div>
  )
}
