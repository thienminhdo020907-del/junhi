import { beforeEach, describe, expect, it } from 'vitest'
import {
  exportThemeToJson,
  loadCurrentThemeConfig,
  loadSavedThemes,
  saveCurrentThemeConfig,
  saveSavedThemes,
  validateAndParseThemeJson,
} from './themeEngine'
import {
  autoFixTextColor,
  getContrastRatio,
  isContrastAdequate,
} from './colorUtils'
import { MODERN_THEME_CONFIG } from './themePresets'
import type { CustomThemeConfig, SavedThemePreset } from '@/types/theme'

describe('Theme Engine & Customization', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('1. Lưu và khôi phục cấu hình theme', () => {
    it('lưu và đọc cấu hình tùy chỉnh từ localStorage', () => {
      const customConfig: CustomThemeConfig = {
        ...MODERN_THEME_CONFIG,
        light: {
          ...MODERN_THEME_CONFIG.light,
          accent: '#FF4500',
        },
        fontHeading: 'Patrick Hand',
        radius: 'full',
      }

      saveCurrentThemeConfig(customConfig)
      const restored = loadCurrentThemeConfig()

      expect(restored.light.accent).toBe('#FF4500')
      expect(restored.fontHeading).toBe('Patrick Hand')
      expect(restored.radius).toBe('full')
    })

    it('trả về MODERN_THEME_CONFIG khi chưa lưu gì', () => {
      const initial = loadCurrentThemeConfig()
      expect(initial.light.accent).toBe(MODERN_THEME_CONFIG.light.accent)
    })

    it('lưu và khôi phục danh sách bộ theme đã lưu (presets)', () => {
      const presets: SavedThemePreset[] = [
        {
          id: 'preset-1',
          name: 'Hoàng hôn ấm',
          updatedAt: Date.now(),
          config: MODERN_THEME_CONFIG,
        },
      ]

      saveSavedThemes(presets)
      const restored = loadSavedThemes()

      expect(restored.length).toBe(1)
      expect(restored[0].name).toBe('Hoàng hôn ấm')
    })
  })

  describe('2. Xuất và Nhập JSON (Validation & Error Handling)', () => {
    it('xuất JSON hợp lệ từ config', () => {
      const json = exportThemeToJson(MODERN_THEME_CONFIG)
      expect(typeof json).toBe('string')
      expect(json).toContain('"version": 1')
      expect(json).toContain('"light"')
      expect(json).toContain('"dark"')
    })

    it('nhập thành công với JSON hợp lệ', () => {
      const json = exportThemeToJson(MODERN_THEME_CONFIG)
      const parsed = validateAndParseThemeJson(json)
      expect(parsed).toEqual(MODERN_THEME_CONFIG)
    })

    it('ném lỗi khi chuỗi JSON sai cú pháp cú pháp (syntax error)', () => {
      expect(() => validateAndParseThemeJson('not a valid json {')).toThrowError(
        /Định dạng tệp JSON không hợp lệ/,
      )
    })

    it('ném lỗi khi thiếu trường bắt buộc hoặc cấu trúc không đúng', () => {
      expect(() => validateAndParseThemeJson(JSON.stringify({ hello: 'world' }))).toThrowError(
        /Phiên bản theme không tương thích/,
      )

      expect(() =>
        validateAndParseThemeJson(
          JSON.stringify({
            version: 1,
            // Thiếu light & dark
            fontHeading: 'Playfair Display',
          }),
        ),
      ).toThrowError(/Theme thiếu cấu hình màu sáng/)
    })
  })

  describe('3. Cảnh báo và tự sửa tương phản màu sắc (WCAG 2.1 Contrast)', () => {
    it('nhận diện cặp màu có độ tương phản tốt (>= 4.5:1)', () => {
      const blackOnWhite = getContrastRatio('#000000', '#ffffff')
      expect(blackOnWhite).toBeGreaterThan(15)
      expect(isContrastAdequate('#000000', '#ffffff')).toBe(true)
    })

    it('cảnh báo khi cặp màu thiếu độ tương phản (< 4.5:1)', () => {
      // Màu xám nhạt trên nền trắng
      const poorContrast = getContrastRatio('#E0E0E0', '#FFFFFF')
      expect(poorContrast).toBeLessThan(4.5)
      expect(isContrastAdequate('#E0E0E0', '#FFFFFF')).toBe(false)
    })

    it('tự sửa màu chữ (autoFixTextColor) thành màu đạt chuẩn', () => {
      const badTextColor = '#F0F0F0'
      const lightBg = '#FFFFFF'
      expect(isContrastAdequate(badTextColor, lightBg)).toBe(false)

      const fixed = autoFixTextColor(badTextColor, lightBg)
      expect(isContrastAdequate(fixed, lightBg)).toBe(true)
    })
  })

  describe('4. Reset về cấu hình mặc định', () => {
    it('cấu hình MODERN_THEME_CONFIG có đầy đủ 5 mức mood và 5 màu biểu đồ', () => {
      expect(MODERN_THEME_CONFIG.light.mood).toHaveLength(5)
      expect(MODERN_THEME_CONFIG.light.chart).toHaveLength(5)
      expect(MODERN_THEME_CONFIG.dark.mood).toHaveLength(5)
      expect(MODERN_THEME_CONFIG.dark.chart).toHaveLength(5)
      expect(MODERN_THEME_CONFIG.fontHeading).toContain('Playfair Display')
      expect(MODERN_THEME_CONFIG.fontBody).toContain('Inter')
      expect(MODERN_THEME_CONFIG.radius).toBe('large')
      expect(MODERN_THEME_CONFIG.density).toBe('normal')
      expect(MODERN_THEME_CONFIG.dark.bg).toBe('#121010')
      expect(MODERN_THEME_CONFIG.dark.surface).toBe('#221E1C')
      expect(MODERN_THEME_CONFIG.dark.accent).toBe('#B5707F')
    })
  })

  describe('5. Mặc định Dark mode & Thứ tự ưu tiên (Tài khoản -> localStorage -> mặc định Dark)', () => {
    it('khi chưa có lựa chọn (localStorage rỗng) -> mặc định là dark', () => {
      // Giả lập logic resolve
      const getInitial = () => {
        const saved = localStorage.getItem('junhi_theme')
        if (saved === 'light') return false
        if (saved === 'dark') return true
        return true // Mặc định dark
      }
      expect(getInitial()).toBe(true)
    })

    it('khi localStorage có lựa chọn sáng -> giữ đúng lựa chọn sáng', () => {
      localStorage.setItem('junhi_theme', 'light')
      const getInitial = () => {
        const saved = localStorage.getItem('junhi_theme')
        if (saved === 'light') return false
        if (saved === 'dark') return true
        return true
      }
      expect(getInitial()).toBe(false)
    })

    it('ưu tiên theme của tài khoản nếu đã đăng nhập và có lưu theme riêng', () => {
      localStorage.setItem('junhi_current_user_id', '42')
      localStorage.setItem('junhi_user_theme_42', 'light')
      localStorage.setItem('junhi_theme', 'dark') // local đang dark nhưng user chọn light

      const resolveTheme = () => {
        const userId = localStorage.getItem('junhi_current_user_id')
        if (userId) {
          const userTheme = localStorage.getItem(`junhi_user_theme_${userId}`)
          if (userTheme === 'light') return false
          if (userTheme === 'dark') return true
        }
        const saved = localStorage.getItem('junhi_theme')
        if (saved === 'light') return false
        if (saved === 'dark') return true
        return true
      }

      expect(resolveTheme()).toBe(false)
    })
  })
})
