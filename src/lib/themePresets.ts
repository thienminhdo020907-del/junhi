import type { CustomThemeConfig, ThemeColors } from '@/types/theme'
import { getAccentContrast } from './colorUtils'

export const BACKGROUND_PRESETS = [
  { name: 'Kem ấm', hex: '#F3F1EC', darkHex: '#1A1715' },
  { name: 'Trắng sứ', hex: '#FFFFFF', darkHex: '#121212' },
  { name: 'Xám nhạt', hex: '#F1F5F9', darkHex: '#0F172A' },
  { name: 'Xám đậm', hex: '#E2E8F0', darkHex: '#1E293B' },
  { name: 'Nâu đen', hex: '#FAF5EE', darkHex: '#1F1C1A' },
  { name: 'Hồng phấn nhạt', hex: '#FDF2F4', darkHex: '#2A181C' },
  { name: 'Xanh bạc hà nhạt', hex: '#F0F9F5', darkHex: '#12251D' },
  { name: 'Xanh trời nhạt', hex: '#F0F7FD', darkHex: '#152433' },
  { name: 'Tím lavender nhạt', hex: '#F7F3FB', darkHex: '#22192F' },
]

export const ACCENT_PRESETS = [
  { name: 'Hồng phấn', hex: '#E89BA7' },
  { name: 'Hồng sen', hex: '#E11D48' },
  { name: 'Cam đào', hex: '#F97316' },
  { name: 'Vàng bơ', hex: '#F59E0B' },
  { name: 'Xanh bạc hà', hex: '#10B981' },
  { name: 'Xanh ngọc', hex: '#0D9488' },
  { name: 'Xanh da trời', hex: '#0EA5E9' },
  { name: 'Xanh biển sâu', hex: '#3B82F6' },
  { name: 'Tím hoa cà', hex: '#8B5CF6' },
  { name: 'Tím berry', hex: '#A855F7' },
  { name: 'Nâu caramen', hex: '#B45309' },
  { name: 'Đỏ ruby', hex: '#DC2626' },
]

export const MOOD_PALETTES: { name: string; colors: [string, string, string, string, string] }[] = [
  {
    name: 'Đất ấm (Mặc định)',
    colors: ['#E08A82', '#F2B58B', '#F6E3A8', '#BFDDCB', '#8CC3A0'],
  },
  {
    name: 'Pastel kẹo ngọt',
    colors: ['#FFAAA6', '#FFD3B5', '#DCEDC2', '#A8E6CF', '#B8DEFF'],
  },
  {
    name: 'Cầu vồng rực rỡ',
    colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
  },
  {
    name: 'Đơn sắc Xanh bạc hà',
    colors: ['#D1E7DD', '#A3CFBB', '#75B798', '#479F76', '#198754'],
  },
  {
    name: 'Đơn sắc Hồng vintage',
    colors: ['#F8D7DA', '#F1AEB5', '#EA868F', '#E35D6A', '#DC3545'],
  },
  {
    name: 'Tương phản cao',
    colors: ['#991B1B', '#C2410C', '#854D0E', '#166534', '#1E40AF'],
  },
]

export const CHART_PALETTES: { name: string; colors: [string, string, string, string, string] }[] = [
  {
    name: 'Cổ điển Junhi',
    colors: ['#7C6CF0', '#16A34A', '#F59E0B', '#EF4444', '#06B6D4'],
  },
  {
    name: 'Pastel dịu nhẹ',
    colors: ['#F4C6D0', '#CFE3DD', '#F6E3A8', '#CFE0F1', '#D9CFEA'],
  },
  {
    name: 'Vườn hoa nhiệt đới',
    colors: ['#F43F5E', '#10B981', '#F59E0B', '#6366F1', '#14B8A6'],
  },
  {
    name: 'Đêm tím Cyber',
    colors: ['#A855F7', '#38BDF8', '#4ADE80', '#F472B6', '#FBBF24'],
  },
  {
    name: 'Đơn sắc Tối giản',
    colors: ['#334155', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'],
  },
]

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  bg: '#F3F1EC',
  surface: '#FBFAF7',
  surface2: '#EFECE6',
  text: '#2B2724',
  textMuted: '#7A736B',
  border: 'rgba(43, 39, 36, 0.14)',
  borderStrong: '#2B2724',
  accent: '#E89BA7',
  accentContrast: '#2B2724',
  mood: ['#E08A82', '#F2B58B', '#F6E3A8', '#BFDDCB', '#8CC3A0'],
  chart: ['#7C6CF0', '#16A34A', '#F59E0B', '#EF4444', '#06B6D4'],
}

export const DEFAULT_DARK_COLORS: ThemeColors = {
  bg: '#121010',
  surface: '#221E1C',
  surface2: '#2C2724',
  text: '#F5F2EC',
  textMuted: '#B8AFA4',
  border: 'rgba(255, 255, 255, 0.14)',
  borderStrong: 'rgba(255, 255, 255, 0.35)',
  accent: '#B5707F',
  accentContrast: '#F5F2EC',
  mood: ['#A6524A', '#AA6E44', '#9E8955', '#577767', '#477759'],
  chart: ['#9D8FF7', '#4ADE80', '#FBBF24', '#F87171', '#38BDF8'],
}

export const MODERN_THEME_CONFIG: CustomThemeConfig = {
  version: 1,
  id: 'modern',
  name: 'Hiện đại (Modern)',
  colorMode: 'system',
  light: DEFAULT_LIGHT_COLORS,
  dark: DEFAULT_DARK_COLORS,
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', 'Inter', sans-serif",
  fontSizeBase: 16,
  lineHeight: 1.6,
  radius: 'large',
  borderStyle: 'thin',
  shadowStyle: 'soft',
  density: 'normal',
  animation: 'playful',
  iconLibrary: 'lucide',
}

export const WIN95_THEME_CONFIG: CustomThemeConfig = {
  version: 1,
  id: 'win95',
  name: 'Retro Win95 / Paint',
  colorMode: 'light',
  light: {
    bg: '#C0C0C0',
    surface: '#E0E0E0',
    surface2: '#D4D0C8',
    text: '#000000',
    textMuted: '#555555',
    border: '#808080',
    borderStrong: '#000000',
    accent: '#000080',
    accentContrast: '#FFFFFF',
    mood: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0000FF'],
    chart: ['#000080', '#008000', '#800080', '#808000', '#008080'],
  },
  dark: {
    bg: '#000000',
    surface: '#1A1A1A',
    surface2: '#2A2A2A',
    text: '#00FF00',
    textMuted: '#00AA00',
    border: '#00AA00',
    borderStrong: '#00FF00',
    accent: '#00FF00',
    accentContrast: '#000000',
    mood: ['#FF3333', '#FF9933', '#FFFF33', '#33FF33', '#3399FF'],
    chart: ['#00FF00', '#33FF33', '#FFFF00', '#FF3333', '#00FFFF'],
  },
  fontHeading: "'Space Grotesk', sans-serif",
  fontBody: "'Space Mono', monospace",
  fontSizeBase: 15,
  lineHeight: 1.5,
  radius: 'square',
  borderStyle: 'hand-drawn',
  shadowStyle: 'retro-hard',
  density: 'compact',
  animation: 'none',
  iconLibrary: 'lucide',
}

/** Randomize a harmonious theme configuration */
export function generateRandomTheme(currentMode: 'light' | 'dark' = 'light'): CustomThemeConfig {
  const bgPreset = BACKGROUND_PRESETS[Math.floor(Math.random() * BACKGROUND_PRESETS.length)]
  const accentPreset = ACCENT_PRESETS[Math.floor(Math.random() * ACCENT_PRESETS.length)]
  const moodPal = MOOD_PALETTES[Math.floor(Math.random() * MOOD_PALETTES.length)]
  const chartPal = CHART_PALETTES[Math.floor(Math.random() * CHART_PALETTES.length)]

  const radii: CustomThemeConfig['radius'][] = ['small', 'medium', 'large', 'full']
  const borders: CustomThemeConfig['borderStyle'][] = ['none', 'thin', 'hand-drawn']
  const shadows: CustomThemeConfig['shadowStyle'][] = ['none', 'flat', 'soft', 'retro-hard']
  const densities: CustomThemeConfig['density'][] = ['compact', 'normal', 'spacious']

  const lightColors: ThemeColors = {
    bg: bgPreset.hex,
    surface: bgPreset.hex === '#FFFFFF' ? '#F8FAFC' : '#FBFAF7',
    surface2: '#EFECE6',
    text: '#2B2724',
    textMuted: '#7A736B',
    border: 'rgba(43, 39, 36, 0.14)',
    borderStrong: '#2B2724',
    accent: accentPreset.hex,
    accentContrast: getAccentContrast(accentPreset.hex),
    mood: moodPal.colors,
    chart: chartPal.colors,
  }

  const darkColors: ThemeColors = {
    bg: bgPreset.darkHex,
    surface: '#26221F',
    surface2: '#302B27',
    text: '#F5F2EC',
    textMuted: '#B8AFA4',
    border: 'rgba(255, 255, 255, 0.14)',
    borderStrong: 'rgba(255, 255, 255, 0.35)',
    accent: accentPreset.hex,
    accentContrast: getAccentContrast(accentPreset.hex),
    mood: moodPal.colors,
    chart: chartPal.colors,
  }

  return {
    version: 1,
    id: `custom-${Date.now()}`,
    name: `Xáo trộn: ${accentPreset.name}`,
    colorMode: currentMode,
    light: lightColors,
    dark: darkColors,
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'DM Sans', sans-serif",
    fontSizeBase: Math.floor(Math.random() * 4) + 15, // 15 - 18px
    lineHeight: 1.6,
    radius: radii[Math.floor(Math.random() * radii.length)],
    borderStyle: borders[Math.floor(Math.random() * borders.length)],
    shadowStyle: shadows[Math.floor(Math.random() * shadows.length)],
    density: densities[Math.floor(Math.random() * densities.length)],
    animation: 'playful',
    iconLibrary: 'lucide',
  }
}
