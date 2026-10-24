import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Plus, X } from 'lucide-react'
import { EMOTION_TAGS } from '@/constants/entry'
import { useCustomTags } from '@/db/useCustomTags'
import { MAX_TAG_LENGTH, validateNewTag } from '@/lib/customTags'

interface Props {
  /** Các tag đã chọn cho ngày hôm nay */
  selected: string[]
  onToggle: (tag: string) => void
  /** Đảm bảo tag được chọn (không bỏ chọn nếu đã chọn) */
  onSelect: (tag: string) => void
}

const COUNTER_FROM = MAX_TAG_LENGTH - 5

const chipBase =
  'rounded-full border-[1.5px] px-3.5 py-1.5 text-xs sm:text-sm font-sans transition-all hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]'
const chipOn =
  'border-[var(--border-strong)] bg-[var(--pastel-mint)] text-[var(--accent-contrast)] font-medium shadow-[1.5px_2px_0px_var(--border-strong)]'
const chipOff =
  'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'

const MESSAGES = {
  empty: 'hãy nhập một cảm xúc nhé',
  too_long: `tối đa ${MAX_TAG_LENGTH} ký tự thôi nha`,
  limit: 'bạn đã có nhiều cảm xúc riêng rồi',
} as const

export default function TagPicker({ selected, onToggle, onSelect }: Props) {
  const { tags: custom, add, remove } = useCustomTags()
  const reduce = useReducedMotion()
  const inputId = useId()
  const formRef = useRef<HTMLFormElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const addBtnRef = useRef<HTMLButtonElement | null>(null)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [shake, setShake] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const close = (restoreFocus = false) => {
    setEditing(false)
    setDraft('')
    setMessage(null)
    if (restoreFocus) requestAnimationFrame(() => addBtnRef.current?.focus())
  }

  // Bấm ra ngoài thì hủy
  useEffect(() => {
    if (!editing) return
    const onPointerDown = (e: PointerEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = async () => {
    const result = validateNewTag(draft, custom)
    if (result.ok) {
      setJustAdded(result.tag)
      await add(result.tag)
      onSelect(result.tag)
      close(true)
      return
    }
    if (result.reason === 'duplicate') {
      // Chọn chip cũ và rung nhẹ thay vì tạo mới
      onSelect(result.existing)
      setShake(result.existing)
      window.setTimeout(() => setShake(null), 500)
      close(true)
      return
    }
    setMessage(MESSAGES[result.reason])
  }

  const onFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close(true)
    }
  }

  const handleRemove = async (tag: string) => {
    if (!window.confirm('xóa khỏi danh sách? các ngày cũ vẫn giữ tag này')) return
    await remove(tag)
    if (selected.includes(tag)) onToggle(tag)
  }

  // Tag đang chọn nhưng không có trong danh sách (vd. ngày cũ từ thiết bị khác)
  const known = new Set<string>([...EMOTION_TAGS, ...custom])
  const orphans = selected.filter((t) => !known.has(t))

  const renderChip = (t: string, deletable: boolean) => {
    const on = selected.includes(t)
    const appear = justAdded === t && !reduce
    return (
      <motion.div
        key={t}
        layout={!reduce}
        initial={appear ? { scale: 0.6, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1, x: shake === t && !reduce ? [0, -5, 5, -4, 4, 0] : 0 }}
        transition={
          shake === t ? { duration: 0.4 } : { type: 'spring', stiffness: 260, damping: 16 }
        }
        className="group relative"
      >
        <button
          type="button"
          aria-pressed={on}
          onClick={() => onToggle(t)}
          className={`${chipBase} ${on ? chipOn : chipOff}`}
        >
          {t}
        </button>
        {deletable && (
          <button
            type="button"
            aria-label={`Xóa cảm xúc ${t}`}
            onClick={() => void handleRemove(t)}
            className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text)] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--accent)] [@media(hover:none)]:opacity-100"
          >
            <X size={10} aria-hidden="true" />
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <div>
      <motion.div layout={!reduce} className="flex flex-wrap items-center gap-2">
        {EMOTION_TAGS.map((t) => renderChip(t, false))}
        {custom.map((t) => renderChip(t, true))}
        {orphans.map((t) => renderChip(t, false))}

        <AnimatePresence mode="popLayout" initial={false}>
          {editing ? (
            <motion.form
              key="editor"
              ref={formRef}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void commit()
              }}
              onKeyDown={onFormKeyDown}
              className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] py-1 pr-1 pl-3.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]"
            >
              <label htmlFor={inputId} className="sr-only">
                Cảm xúc của bạn
              </label>
              <input
                id={inputId}
                ref={inputRef}
                value={draft}
                maxLength={MAX_TAG_LENGTH}
                placeholder="cảm xúc của bạn…"
                autoComplete="off"
                onChange={(e) => {
                  setDraft(e.target.value)
                  setMessage(null)
                }}
                className="h-5 w-32 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] sm:w-36 sm:text-sm"
              />
              {draft.length >= COUNTER_FROM && (
                <span
                  className="font-mono text-[10px] text-[var(--text-muted)]"
                  aria-label={`${draft.length} trên ${MAX_TAG_LENGTH} ký tự`}
                >
                  {draft.length}/{MAX_TAG_LENGTH}
                </span>
              )}
              <button
                type="submit"
                aria-label="Lưu cảm xúc"
                className="flex size-6 items-center justify-center rounded-full bg-[var(--pastel-mint)] text-[var(--accent-contrast)] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <Check size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Hủy"
                onClick={() => close(true)}
                className="flex size-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-transform hover:scale-110 hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </motion.form>
          ) : (
            <motion.button
              key="add"
              ref={addBtnRef}
              type="button"
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              aria-label="Thêm cảm xúc mới"
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-dashed border-[var(--border)] px-3.5 py-1.5 text-xs text-[var(--text-muted)] transition-[border-color,background-color,color,translate] hover:-translate-y-0.5 hover:border-solid hover:bg-[var(--accent-butter)] hover:text-[var(--accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:text-sm"
            >
              <Plus size={15} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-4 font-sans text-xs ${message ? 'text-[var(--danger)]' : ''}`}
      >
        {message}
      </p>
    </div>
  )
}
