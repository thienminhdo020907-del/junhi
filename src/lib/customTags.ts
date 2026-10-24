import { EMOTION_TAGS } from '@/constants/entry'

export const MAX_TAG_LENGTH = 20
export const MAX_CUSTOM_TAGS = 30

/** Cắt khoảng trắng đầu/cuối và gộp khoảng trắng thừa ở giữa. */
export const normalizeTagLabel = (raw: string): string => raw.trim().replace(/\s+/g, ' ')

/** Khóa so sánh: không phân biệt hoa/thường và dấu tiếng Việt (NFD, bỏ dấu kết hợp, đ → d). */
export const tagKey = (label: string): string =>
  normalizeTagLabel(label)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

export type TagValidation =
  | { ok: true; tag: string }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'too_long' }
  | { ok: false; reason: 'limit' }
  | { ok: false; reason: 'duplicate'; existing: string }

/**
 * Kiểm tra tag mới. `custom` là danh sách tag tùy chỉnh đã có;
 * tag mặc định cũng được tính vào việc chặn trùng.
 */
export function validateNewTag(
  raw: string,
  custom: readonly string[],
  defaults: readonly string[] = EMOTION_TAGS,
): TagValidation {
  const tag = normalizeTagLabel(raw)
  if (!tag) return { ok: false, reason: 'empty' }
  if (tag.length > MAX_TAG_LENGTH) return { ok: false, reason: 'too_long' }

  const key = tagKey(tag)
  const existing = [...defaults, ...custom].find((t) => tagKey(t) === key)
  if (existing) return { ok: false, reason: 'duplicate', existing }

  if (custom.length >= MAX_CUSTOM_TAGS) return { ok: false, reason: 'limit' }
  return { ok: true, tag }
}

export const isDefaultTag = (tag: string): boolean =>
  (EMOTION_TAGS as readonly string[]).includes(tag)
