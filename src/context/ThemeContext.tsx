import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CustomThemeConfig, SavedThemePreset } from '@/types/theme'
import {
  applyThemeToDom,
  loadCurrentThemeConfig,
  loadSavedThemes,
  saveCurrentThemeConfig,
  saveSavedThemes,
} from '@/lib/themeEngine'
import {
  generateRandomTheme,
  MODERN_THEME_CONFIG,
  WIN95_THEME_CONFIG,
} from '@/lib/themePresets'
import { BODY_FONTS, HEADING_FONTS, loadFontOnDemand } from '@/lib/fontLoader'
import { ThemeContext, type ThemeMode } from './theme-context-definition'

const THEME_MODE_KEY = 'junhi_theme_mode'
const DARK_THEME_KEY = 'junhi_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_MODE_KEY)
    if (saved === 'win95' || saved === 'custom') return saved
    return 'modern'
  })

  const [isDark, setIsDarkState] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return false
    const saved = localStorage.getItem(DARK_THEME_KEY)
    if (saved) return saved === 'dark'
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [customConfig, setCustomConfigState] = useState<CustomThemeConfig>(() => {
    return loadCurrentThemeConfig()
  })

  const [savedThemes, setSavedThemes] = useState<SavedThemePreset[]>(() => {
    return loadSavedThemes()
  })

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isComparing, setIsComparing] = useState(false)

  // Undo history stack
  const historyRef = useRef<CustomThemeConfig[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const debounceSaveTimer = useRef<number | null>(null)

  // Initial config before user started tweaking (for comparison)
  const initialCompareConfigRef = useRef<CustomThemeConfig>(customConfig)

  // Helper to load fonts
  useEffect(() => {
    const headFont = HEADING_FONTS.find((f) => f.family === customConfig.fontHeading)
    const bodyFont = BODY_FONTS.find((f) => f.family === customConfig.fontBody)
    if (headFont) loadFontOnDemand(headFont)
    if (bodyFont) loadFontOnDemand(bodyFont)
  }, [customConfig.fontHeading, customConfig.fontBody])

  // Sync mode and classes to <html>
  const setIsDark = useCallback((dark: boolean) => {
    setIsDarkState(dark)
    localStorage.setItem(DARK_THEME_KEY, dark ? 'dark' : 'light')
    const root = document.documentElement
    const body = document.body
    if (dark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      body.classList.add('dark')
      body.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      body.classList.remove('dark')
      body.setAttribute('data-theme', 'light')
    }
  }, [])

  // Apply to DOM immediately
  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, theme)

    if (theme === 'win95') {
      document.documentElement.classList.add('theme-win95')
      applyThemeToDom(WIN95_THEME_CONFIG, isDark)
    } else {
      document.documentElement.classList.remove('theme-win95')
      if (theme === 'modern') {
        applyThemeToDom(MODERN_THEME_CONFIG, isDark)
      } else {
        // Custom theme or comparing
        const configToApply = isComparing ? initialCompareConfigRef.current : customConfig
        applyThemeToDom(configToApply, isDark)
      }
    }
  }, [theme, customConfig, isDark, isComparing])

  // Update theme mode
  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t)
    if (t === 'custom') {
      setIsEditorOpen(true)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'modern' ? 'win95' : 'modern'))
  }, [])

  // Update custom configuration with debounced save & history
  const updateCustomConfig = useCallback(
    (updater: Partial<CustomThemeConfig> | ((prev: CustomThemeConfig) => CustomThemeConfig)) => {
      setCustomConfigState((prev) => {
        // Push current state to undo history
        historyRef.current = [...historyRef.current.slice(-19), prev]
        setCanUndo(true)

        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }

        // Switch to custom mode automatically if tweaking presets
        setThemeState('custom')

        // Apply immediately to DOM
        applyThemeToDom(next, isDark)

        // Debounce storage write (150ms)
        if (debounceSaveTimer.current) window.clearTimeout(debounceSaveTimer.current)
        debounceSaveTimer.current = window.setTimeout(() => {
          saveCurrentThemeConfig(next)
        }, 150)

        return next
      })
    },
    [isDark],
  )

  // Undo action
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setCanUndo(historyRef.current.length > 0)
    setCustomConfigState(prev)
    applyThemeToDom(prev, isDark)
    saveCurrentThemeConfig(prev)
  }, [isDark])

  // Keyboard shortcut Ctrl+Z / Cmd+Z to undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        // Only undo theme if theme editor is open or active
        if (isEditorOpen && canUndo) {
          const activeEl = document.activeElement
          const isTyping =
            activeEl?.tagName === 'INPUT' ||
            activeEl?.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement)?.isContentEditable
          if (!isTyping) {
            e.preventDefault()
            undo()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditorOpen, canUndo, undo])

  // Reset to default
  const resetToDefault = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-19), customConfig]
    setCanUndo(true)
    setCustomConfigState(MODERN_THEME_CONFIG)
    applyThemeToDom(MODERN_THEME_CONFIG, isDark)
    saveCurrentThemeConfig(MODERN_THEME_CONFIG)
    setThemeState('modern')
  }, [customConfig, isDark])

  // Shuffle theme
  const shuffleTheme = useCallback(() => {
    const next = generateRandomTheme(isDark ? 'dark' : 'light')
    updateCustomConfig(next)
  }, [isDark, updateCustomConfig])

  // Saved theme presets
  const saveCurrentAsPreset = useCallback(
    (name: string) => {
      const newPreset: SavedThemePreset = {
        id: `preset-${Date.now()}`,
        name: name.trim() || `Giao diện ${savedThemes.length + 1}`,
        updatedAt: Date.now(),
        config: customConfig,
      }
      const updated = [newPreset, ...savedThemes.filter((p) => p.name !== newPreset.name)].slice(
        0,
        10,
      )
      setSavedThemes(updated)
      saveSavedThemes(updated)
    },
    [customConfig, savedThemes],
  )

  const applySavedPreset = useCallback(
    (presetId: string) => {
      const found = savedThemes.find((p) => p.id === presetId)
      if (found) {
        updateCustomConfig(found.config)
      }
    },
    [savedThemes, updateCustomConfig],
  )

  const deleteSavedPreset = useCallback(
    (presetId: string) => {
      const updated = savedThemes.filter((p) => p.id !== presetId)
      setSavedThemes(updated)
      saveSavedThemes(updated)
    },
    [savedThemes],
  )

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
        setIsDark,
        customConfig,
        updateCustomConfig,
        savedThemes,
        saveCurrentAsPreset,
        applySavedPreset,
        deleteSavedPreset,
        resetToDefault,
        shuffleTheme,
        undo,
        canUndo,
        isComparing,
        setIsComparing,
        isEditorOpen,
        setIsEditorOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
