import { useState, useRef, useEffect } from 'react'
import { Search, X, AlertCircle } from 'lucide-react'
import type { FontOption } from '@/types/theme'
import { loadFontOnDemand } from '@/lib/fontLoader'

interface Props {
  currentFamily: string
  label: string
  fonts: FontOption[]
  filterVietnameseOnly?: boolean
  onChange: (family: string) => void
  onClose: () => void
}

export default function FontPickerPopover({
  currentFamily,
  label,
  fonts,
  filterVietnameseOnly = false,
  onChange,
  onClose,
}: Props) {
  const [query, setQuery] = useState('')
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // Preload visible fonts
  useEffect(() => {
    fonts.forEach((f) => loadFontOnDemand(f))
  }, [fonts])

  // Click outside to close
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  const filteredFonts = fonts.filter((f) => {
    if (filterVietnameseOnly && !f.vietnamese) return false
    return f.name.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 text-[var(--text)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text)]">{label}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm font chữ..."
          className="h-8 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Font List */}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {filteredFonts.map((f) => {
          const isSelected = f.family === currentFamily
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => {
                loadFontOnDemand(f)
                onChange(f.family)
                onClose()
              }}
              className={`flex w-full flex-col items-start rounded-xl p-2.5 text-left transition-all ${
                isSelected
                  ? 'border border-[var(--accent)] bg-[var(--surface)] shadow-xs'
                  : 'border border-transparent hover:bg-[var(--surface)]'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text)]">{f.name}</span>
                {!f.vietnamese && (
                  <span
                    title="Font này có thể không hiển thị đầy đủ dấu tiếng Việt"
                    className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400"
                  >
                    <AlertCircle size={10} /> Không dấu VN
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-sm text-[var(--text)]"
                style={{ fontFamily: f.family }}
              >
                Hôm nay bạn thế nào? ✿
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
