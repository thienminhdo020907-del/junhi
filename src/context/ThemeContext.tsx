import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeMode } from './theme-context-definition'

const THEME_KEY = 'junhi_theme_mode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'win95' ? 'win95' : 'modern'
  })

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    if (theme === 'win95') {
      document.documentElement.classList.add('theme-win95')
    } else {
      document.documentElement.classList.remove('theme-win95')
    }
  }, [theme])

  const setTheme = (t: ThemeMode) => setThemeState(t)
  const toggleTheme = () => setThemeState((prev) => (prev === 'modern' ? 'win95' : 'modern'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
