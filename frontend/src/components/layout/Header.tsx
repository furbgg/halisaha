import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../../store/themeStore'
import Sidebar from './Sidebar'

export default function Header() {
  const { isDark, toggle } = useThemeStore()
  const { i18n } = useTranslation()

  const flags = { de: '🇩🇪', tr: '🇹🇷', en: '🇬🇧', bs: '🇧🇦', sq: '🇦🇱' }
  const langs = Object.keys(flags)

  const toggleLang = () => {
    const nextIdx = (langs.indexOf(i18n.language) + 1) % langs.length
    i18n.changeLanguage(langs[nextIdx])
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-surface-lighter">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Sidebar />

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-surface-lighter transition-colors text-lg"
            aria-label={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            onClick={toggleLang}
            className="p-2 rounded-lg hover:bg-surface-lighter transition-colors text-sm font-medium"
            title="Sprache ändern"
            aria-label="Sprache ändern"
          >
            {flags[i18n.language as keyof typeof flags] || '🇩🇪'}
          </button>
        </div>
      </div>
    </header>
  )
}
