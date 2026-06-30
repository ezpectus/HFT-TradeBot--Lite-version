import { useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'trading-sim-theme'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEY, 'dark')

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, toggleTheme }
}
