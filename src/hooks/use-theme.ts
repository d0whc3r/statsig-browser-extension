import { useEffect } from 'react'

import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { themeStorage } from '@/src/lib/storage'

export function useTheme() {
  const [theme, setTheme, isLoading] = useWxtStorage(themeStorage)

  useEffect(() => {
    if (isLoading || !theme) {
      return
    }

    const applyTheme = (currentTheme: 'light' | 'dark' | 'system') => {
      const root = globalThis.document.documentElement

      root.classList.remove('light', 'dark')

      if (currentTheme === 'system') {
        const systemTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(currentTheme)
      }
    }

    applyTheme(theme)

    // Listen to system preference changes if 'system' is selected
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    // oxlint-disable-next-line typescript/consistent-return
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, isLoading])

  const setResolvedTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  // To make it easy to get the actual applied theme (light/dark)
  const isSystemDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
  const resolvedTheme = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme

  return { isLoading, resolvedTheme, setTheme: setResolvedTheme, theme }
}
