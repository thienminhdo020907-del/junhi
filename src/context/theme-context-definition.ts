import { createContext } from 'react'
import type { CustomThemeConfig, SavedThemePreset } from '@/types/theme'

export type ThemeMode = 'modern' | 'win95' | 'custom'

export interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
  setIsDark: (dark: boolean) => void
  customConfig: CustomThemeConfig
  updateCustomConfig: (
    updater: Partial<CustomThemeConfig> | ((prev: CustomThemeConfig) => CustomThemeConfig),
  ) => void
  savedThemes: SavedThemePreset[]
  saveCurrentAsPreset: (name: string) => void
  applySavedPreset: (presetId: string) => void
  deleteSavedPreset: (presetId: string) => void
  resetToDefault: () => void
  shuffleTheme: () => void
  undo: () => void
  canUndo: boolean
  isComparing: boolean
  setIsComparing: (comparing: boolean) => void
  isEditorOpen: boolean
  setIsEditorOpen: (open: boolean) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)
