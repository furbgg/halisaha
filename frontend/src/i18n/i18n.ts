import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from './de.json'
import tr from './tr.json'
import en from './en.json'
import bs from './bs.json'
import sq from './sq.json'

const savedLanguage = localStorage.getItem('i18nextLng') || 'de'

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    tr: { translation: tr },
    en: { translation: en },
    bs: { translation: bs },
    sq: { translation: sq },
  },
  lng: savedLanguage,
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
})

export default i18n
