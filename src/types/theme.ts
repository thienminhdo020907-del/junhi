export type RadiusLevel = 'square' | 'small' | 'medium' | 'large' | 'full'
export type BorderLevel = 'none' | 'thin' | 'hand-drawn'
export type ShadowLevel = 'none' | 'flat' | 'soft' | 'retro-hard'
export type DensityLevel = 'compact' | 'normal' | 'spacious'
export type AnimationLevel = 'none' | 'subtle' | 'playful'
export type IconLibrary = 'lucide' | 'phosphor' | 'doodle'
export type ThemeColorMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  bg: string
  surface: string
  surface2: string
  text: string
  textMuted: string
  border: string
  borderStrong: string
  accent: string
  accentContrast: string
  mood: [string, string, string, string, string]
  chart: [string, string, string, string, string]
}

export interface CustomThemeConfig {
  version: 1
  id: string
  name: string
  colorMode: ThemeColorMode
  light: ThemeColors
  dark: ThemeColors
  // Typography
  fontHeading: string
  fontBody: string
  fontSizeBase: number // 14 to 20
  lineHeight: number // 1.4 to 1.9
  // UI geometry & feel
  radius: RadiusLevel
  borderStyle: BorderLevel
  shadowStyle: ShadowLevel
  density: DensityLevel
  animation: AnimationLevel
  iconLibrary: IconLibrary
}

export interface SavedThemePreset {
  id: string
  name: string
  updatedAt: number
  config: CustomThemeConfig
}

export interface FontOption {
  name: string
  family: string
  category: 'serif' | 'sans' | 'handwriting' | 'display' | 'mono'
  vietnamese: boolean
  googleFontKey?: string
}
