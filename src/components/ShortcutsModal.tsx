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
      <div className="card w-full max-w-sm !p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-brand-100 pb-3 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-300">
            <Keyboard size={20} />
            <h2 className="text-base">Phím tắt bàn phím</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
            className="rounded-xl p-1 text-slate-400 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="space-y-2.5 text-xs">
          {shortcuts.map((s) => (
            <li key={s.key} className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
              <kbd className="inline-flex min-w-[28px] items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 font-mono text-[11px] font-bold text-brand-700 shadow-2xs dark:border-white/20 dark:bg-white/10 dark:text-brand-200">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          Bấm <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Esc</kbd> hoặc <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">?</kbd> để đóng
        </p>
      </div>
    </div>
  )
}
