import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage.js'
import { runViewTransition } from '../utils/viewTransition.js'

const ThemeContext = createContext(null)

// Masthead colour per theme, for the mobile browser toolbar.
const THEME_COLOR = { light: '#123D28', dark: '#0A2217' }

function initialTheme() {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  const stored = readStorage(STORAGE_KEYS.THEME)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  /**
   * `origin` is the element or click event the change came from. The new
   * theme grows out of it in a circle when View Transitions are available.
   */
  const setTheme = useCallback((next, origin) => {
    if (next !== 'light' && next !== 'dark') return
    if (next === document.documentElement.getAttribute('data-theme')) return
    writeStorage(STORAGE_KEYS.THEME, next)

    let x = window.innerWidth - 40
    let y = 20
    const rect = origin?.currentTarget?.getBoundingClientRect?.() || origin?.getBoundingClientRect?.()
    if (rect) {
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = runViewTransition('vt-theme', () => {
      applyTheme(next)
      setThemeState(next)
    })
    transition?.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: (origin) => setTheme(theme === 'dark' ? 'light' : 'dark', origin),
    }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
