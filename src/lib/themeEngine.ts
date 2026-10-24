import type {
  BorderLevel,
  CustomThemeConfig,
  DensityLevel,
  RadiusLevel,
  SavedThemePreset,
  ShadowLevel,
} from '@/types/theme'
import { MODERN_THEME_CONFIG } from './themePresets'

export const THEME_CONFIG_STORAGE_KEY = 'junhi_custom_theme_config'
export const SAVED_THEMES_STORAGE_KEY = 'junhi_saved_themes'
export const MAX_SAVED_THEMES = 10

export function getRadiusPx(radius: RadiusLevel): string {
  switch (radius) {
    case 'square':
      return '0px'
    case 'small':
      return '8px'
    case 'medium':
      return '16px'
    case 'large':
      return '24px'
    case 'full':
      return '9999px'
    default:
      return '24px'
  }
}

export function getShadowValue(shadow: ShadowLevel): string {
  switch (shadow) {
    case 'none':
      return 'none'
    case 'flat':
      return '0 1px 3px rgba(0,0,0,0.08)'
    case 'soft':
      return '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
    case 'retro-hard':
      return '3px 3px 0px var(--border-strong)'
    default:
      return '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
  }
}

export function getBorderWidth(border: BorderLevel): string {
  switch (border) {
    case 'none':
      return '0px'
    case 'thin':
      return '1px'
    case 'hand-drawn':
      return '2px'
    default:
      return '1.5px'
  }
}

export function getDensityPadding(density: DensityLevel): string {
  switch (density) {
    case 'compact':
      return '0.75rem'
    case 'normal':
      return '1.25rem'
    case 'spacious':
      return '1.75rem'
    default:
      return '1.25rem'
  }
}

/** Áp dụng cấu hình Theme lên document.documentElement styles tức thì */
export function applyThemeToDom(config: CustomThemeConfig, isDark: boolean): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const colors = isDark ? config.dark : config.light

  // 1. Màu sắc chính
  root.style.setProperty('--bg', colors.bg)
  root.style.setProperty('--surface', colors.surface)
  root.style.setProperty('--surface-2', colors.surface2)
  root.style.setProperty('--text', colors.text)
  root.style.setProperty('--text-muted', colors.textMuted)
  root.style.setProperty('--border', colors.border)
  root.style.setProperty('--border-strong', colors.borderStrong)
  root.style.setProperty('--accent', colors.accent)
  root.style.setProperty('--accent-contrast', colors.accentContrast)
  root.style.setProperty('--accent-butter', colors.accent)

  // 2. Màu mood 1-5
  colors.mood.forEach((col, idx) => {
    root.style.setProperty(`--mood-${idx + 1}`, col)
  })

  // 3. Màu chart 1-5
  colors.chart.forEach((col, idx) => {
    root.style.setProperty(`--chart-${idx + 1}`, col)
  })

  // 4. Typography
  root.style.setProperty('--font-heading', config.fontHeading)
  root.style.setProperty('--font-body', config.fontBody)
  root.style.setProperty('--font-size-base', `${config.fontSizeBase}px`)
  root.style.setProperty('--line-height', String(config.lineHeight))

  // 5. Geometry & Geometry tokens
  root.style.setProperty('--radius', getRadiusPx(config.radius))
  root.style.setProperty('--shadow-card', getShadowValue(config.shadowStyle))
  root.style.setProperty('--border-card-width', getBorderWidth(config.borderStyle))
  root.style.setProperty('--card-padding', getDensityPadding(config.density))

  // 6. Meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', colors.bg)
  }
}

/** Tải cấu hình Theme hiện tại từ localStorage */
export function loadCurrentThemeConfig(): CustomThemeConfig {
  if (typeof localStorage === 'undefined') return MODERN_THEME_CONFIG
  try {
    const raw = localStorage.getItem(THEME_CONFIG_STORAGE_KEY)
    if (!raw) return MODERN_THEME_CONFIG
    const parsed = JSON.parse(raw)
    if (parsed && parsed.version === 1 && parsed.light && parsed.dark) {
      return parsed as CustomThemeConfig
    }
  } catch {
    // fallback
  }
  return MODERN_THEME_CONFIG
}

/** Lưu cấu hình Theme hiện tại vào localStorage */
export function saveCurrentThemeConfig(config: CustomThemeConfig): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(config))
}

/** Tải danh sách bộ theme tùy chỉnh đã lưu */
export function loadSavedThemes(): SavedThemePreset[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_THEMES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as SavedThemePreset[]
  } catch {
    // fallback
  }
  return []
}

/** Lưu danh sách bộ theme vào localStorage (tối đa 10 bộ) */
export function saveSavedThemes(themes: SavedThemePreset[]): void {
  if (typeof localStorage === 'undefined') return
  const trimmed = themes.slice(0, MAX_SAVED_THEMES)
  localStorage.setItem(SAVED_THEMES_STORAGE_KEY, JSON.stringify(trimmed))
}

/** Xuất theme ra file JSON và trả về chuỗi JSON */
export function exportThemeToJson(config: CustomThemeConfig): string {
  const json = JSON.stringify(config, null, 2)
  if (typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `junhi-theme-${config.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Bỏ qua nếu môi trường test không có Blob URL
    }
  }
  return json
}

/** Kiểm tra và parse file JSON theme nhập vào */
export function validateAndParseThemeJson(jsonString: string): CustomThemeConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('Định dạng tệp JSON không hợp lệ.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Dữ liệu theme không hợp lệ: phải là một đối tượng JSON.')
  }

  const obj = parsed as Record<string, unknown>
  if (obj.version !== 1) {
    throw new Error('Phiên bản theme không tương thích (chỉ hỗ trợ version 1).')
  }

  if (!obj.light || typeof obj.light !== 'object' || !obj.dark || typeof obj.dark !== 'object') {
    throw new Error('Theme thiếu cấu hình màu sáng (light) hoặc tối (dark).')
  }

  const light = obj.light as Record<string, unknown>
  if (!light.bg || !light.surface || !light.text || !light.accent) {
    throw new Error('Cấu hình màu sắc thiếu các trường bắt buộc (bg, surface, text, accent).')
  }

  return parsed as CustomThemeConfig
}
