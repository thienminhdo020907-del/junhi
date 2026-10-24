import { describe, expect, it } from 'vitest'
import {
  MAX_CUSTOM_TAGS,
  MAX_TAG_LENGTH,
  normalizeTagLabel,
  tagKey,
  validateNewTag,
} from './customTags'

describe('validateNewTag', () => {
  it('thêm: chuẩn hóa khoảng trắng và chấp nhận tag hợp lệ', () => {
    expect(validateNewTag('   biết   ơn   mưa  ', [])).toEqual({ ok: true, tag: 'biết ơn mưa' })
  })

  it('rỗng: từ chối chuỗi rỗng hoặc chỉ có khoảng trắng', () => {
    expect(validateNewTag('', [])).toEqual({ ok: false, reason: 'empty' })
    expect(validateNewTag('    ', [])).toEqual({ ok: false, reason: 'empty' })
  })

  it('quá dài: từ chối trên 20 ký tự, chấp nhận đúng 20', () => {
    expect(validateNewTag('a'.repeat(MAX_TAG_LENGTH + 1), [])).toEqual({
      ok: false,
      reason: 'too_long',
    })
    expect(validateNewTag('a'.repeat(MAX_TAG_LENGTH), []).ok).toBe(true)
  })

  it('trùng: không phân biệt hoa/thường và dấu tiếng Việt', () => {
    expect(validateNewTag('VUI VE', [])).toEqual({
      ok: false,
      reason: 'duplicate',
      existing: 'Vui vẻ',
    })
    expect(validateNewTag('  nhớ  nhà ', ['Nhớ nhà'])).toEqual({
      ok: false,
      reason: 'duplicate',
      existing: 'Nhớ nhà',
    })
    expect(validateNewTag('đáng yêu', ['Dang yeu'])).toMatchObject({ reason: 'duplicate' })
  })

  it('giới hạn: tối đa 30 tag tùy chỉnh', () => {
    const full = Array.from({ length: MAX_CUSTOM_TAGS }, (_, i) => `tag số ${i}`)
    expect(validateNewTag('mới toanh', full)).toEqual({ ok: false, reason: 'limit' })
    expect(validateNewTag('mới toanh', full.slice(1)).ok).toBe(true)
  })

  it('tagKey / normalizeTagLabel', () => {
    expect(tagKey('Đang Lo Lắng')).toBe('dang lo lang')
    expect(normalizeTagLabel('  a   b ')).toBe('a b')
  })
})
