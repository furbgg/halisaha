import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () =>
        set((state) => {
          const next = !state.isDark
          document.body.className = next ? 'dark' : 'light'
          return { isDark: next }
        }),
    }),
    { name: 'theme-storage' }
  )
)
