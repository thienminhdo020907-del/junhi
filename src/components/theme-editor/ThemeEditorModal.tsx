import { useEffect, useState } from 'react'
import {
  X,
  Sparkles,
  Bookmark,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
} from 'lucide-react'
import { useTheme } from '@/context/useTheme'
import ThemeControlPanel from './ThemeControlPanel'
import ThemePreviewPanel from './ThemePreviewPanel'

export default function ThemeEditorModal() {
  const {
    isEditorOpen,
    setIsEditorOpen,
    savedThemes,
    applySavedPreset,
    deleteSavedPreset,
  } = useTheme()

  const [activeTabMobile, setActiveTabMobile] = useState<'controls' | 'preview'>('controls')
  const [showPresetsMenu, setShowPresetsMenu] = useState(false)

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditorOpen) {
        setIsEditorOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditorOpen, setIsEditorOpen])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isEditorOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isEditorOpen])

  if (!isEditorOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 md:p-6 animate-fadeIn"
    >
      {/* Outer Container */}
      <div className="relative flex h-full w-full max-w-7xl flex-col rounded-none sm:rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 sm:px-6 bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="theme-editor-title" className="text-sm sm:text-base font-bold text-[var(--text)]">
                  Studio Giao diện (Theme Creator)
                </h1>
                <span className="rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                  Live
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[var(--text-muted)]">
                Tự do thiết kế màu sắc, font chữ và kiểu dáng ứng dụng theo sở thích của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Saved Themes Dropdown */}
            {savedThemes.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPresetsMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--border-strong)] transition-all"
                >
                  <Bookmark size={13} className="text-[var(--accent)]" />
                  <span className="hidden sm:inline">Bộ đã lưu</span> ({savedThemes.length})
                  <ChevronDown size={13} className="text-[var(--text-muted)]" />
                </button>

                {showPresetsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
                      Các bộ theme đã lưu ({savedThemes.length}/10)
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {savedThemes.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs hover:bg-[var(--surface-2)] transition-colors group"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              applySavedPreset(preset.id)
                              setShowPresetsMenu(false)
                            }}
                            className="flex-1 text-left font-medium text-[var(--text)] truncate pr-2"
                          >
                            {preset.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSavedPreset(preset.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all"
                            title="Xóa bộ này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Tab Switcher */}
            <div className="flex sm:hidden rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5">
              <button
                type="button"
                onClick={() => setActiveTabMobile('controls')}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTabMobile === 'controls'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <SlidersHorizontal size={12} /> Bảng
              </button>
              <button
                type="button"
                onClick={() => setActiveTabMobile('preview')}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTabMobile === 'preview'
                    ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <Eye size={12} /> Xem
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              aria-label="Đóng bảng chỉnh theme"
              onClick={() => setIsEditorOpen(false)}
              className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] active:scale-95 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Desktop 2-column layout / Mobile conditional tab layout */}
          
          {/* Left Column: Control Panel (320-340px) */}
          <div
            className={`w-full sm:w-[340px] shrink-0 border-r border-[var(--border)] bg-[var(--surface-2)] overflow-y-auto ${
              activeTabMobile === 'controls' ? 'flex flex-col' : 'hidden sm:flex sm:flex-col'
            }`}
          >
            <ThemeControlPanel />
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div
            className={`flex-1 overflow-y-auto bg-[var(--bg)] p-4 sm:p-6 md:p-8 ${
              activeTabMobile === 'preview' ? 'block' : 'hidden sm:block'
            }`}
          >
            <ThemePreviewPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
