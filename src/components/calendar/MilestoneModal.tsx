import { useState, useEffect } from 'react'
import { X, Trash2, Calendar, Smile, Tag, RefreshCw } from 'lucide-react'
import {
  MILESTONE_TYPES,
  POPULAR_EMOJIS,
  type Milestone,
  type MilestoneType,
} from '@/db/useMilestones'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialDate?: string
  milestoneToEdit?: Milestone | null
  onSave: (data: {
    date: string
    emoji: string
    title: string
    type: MilestoneType
    note?: string
    repeatYearly?: boolean
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function MilestoneModal({
  isOpen,
  onClose,
  initialDate,
  milestoneToEdit,
  onSave,
  onDelete,
}: Props) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10))
  const [emoji, setEmoji] = useState('🎂')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<MilestoneType>('personal')
  const [note, setNote] = useState('')
  const [repeatYearly, setRepeatYearly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (milestoneToEdit) {
      setDate(milestoneToEdit.date)
      setEmoji(milestoneToEdit.emoji)
      setTitle(milestoneToEdit.title)
      setType(milestoneToEdit.type)
      setNote(milestoneToEdit.note || '')
      setRepeatYearly(!!milestoneToEdit.repeatYearly)
    } else {
      setDate(initialDate || new Date().toISOString().slice(0, 10))
      setEmoji('🎂')
      setTitle('')
      setType('personal')
      setNote('')
      setRepeatYearly(false)
    }
  }, [milestoneToEdit, initialDate, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    try {
      setIsSubmitting(true)
      await onSave({
        date,
        emoji,
        title: title.trim().slice(0, 40),
        type,
        note: note.trim(),
        repeatYearly,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!milestoneToEdit || !onDelete) return
    if (window.confirm('Bạn có chắc muốn xóa cột mốc này?')) {
      try {
        setIsSubmitting(true)
        await onDelete(milestoneToEdit.id)
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{emoji}</span>
            <h2 id="milestone-modal-title" className="text-base font-bold text-[var(--text)]">
              {milestoneToEdit ? 'Chỉnh sửa Cột mốc' : 'Thêm Cột mốc mới'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Emoji Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] mb-2">
              <Smile size={14} /> Biểu tượng (Emoji)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] max-h-24 overflow-y-auto">
              {POPULAR_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`size-8 rounded-xl text-lg flex items-center justify-center transition-all ${
                    emoji === em
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] scale-110 shadow-xs'
                      : 'hover:bg-[var(--surface)] hover:scale-105'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Max Length Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="milestone-title" className="text-xs font-semibold text-[var(--text-muted)]">
                Tên cột mốc *
              </label>
              <span className={`text-[11px] font-mono ${title.length >= 35 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                {title.length}/40
              </span>
            </div>
            <input
              id="milestone-title"
              type="text"
              required
              maxLength={40}
              placeholder="ví dụ: Sinh nhật, Ra mắt dự án, Tốt nghiệp…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="milestone-date" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] mb-1.5">
              <Calendar size={14} /> Ngày diễn ra *
            </label>
            <input
              id="milestone-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>

          {/* Type Category */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] mb-2">
              <Tag size={14} /> Phân loại
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MILESTONE_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-1.5 px-2 text-xs font-semibold transition-all ${
                    type === t.type
                      ? 'border-[var(--border-strong)] shadow-xs font-bold'
                      : 'border-[var(--border)] opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: type === t.type ? t.bgColor : 'transparent',
                    color: t.color,
                  }}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Yearly Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} className="text-[var(--accent)]" />
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">Lặp lại hằng năm</p>
                <p className="text-[10px] text-[var(--text-muted)]">Tự động hiện lại vào ngày này ở các năm sau</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={repeatYearly}
              onClick={() => setRepeatYearly(!repeatYearly)}
              className={`relative h-6 w-11 rounded-full transition-colors border border-[var(--border)] ${
                repeatYearly ? 'bg-[var(--accent)]' : 'bg-[var(--surface)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-white shadow-xs transition-transform ${
                  repeatYearly ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Note Input */}
          <div>
            <label htmlFor="milestone-note" className="text-xs font-semibold text-[var(--text-muted)] mb-1.5 block">
              Ghi chú thêm (tùy chọn)
            </label>
            <textarea
              id="milestone-note"
              rows={2}
              placeholder="Cảm nghĩ hoặc chi tiết về cột mốc này…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {milestoneToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
              >
                <Trash2 size={14} /> Xóa cột mốc
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--accent)] px-5 py-2 text-xs font-bold text-[var(--accent-contrast)] shadow-[1.5px_2px_0px_var(--border-strong)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Đang lưu...' : milestoneToEdit ? 'Cập nhật' : 'Thêm mốc'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
