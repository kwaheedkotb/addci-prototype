'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import en from '@/locales/en.json'
import ar from '@/locales/ar.json'

type Locale = 'en' | 'ar'
type Translations = typeof en

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
  dir: 'ltr' | 'rtl'
}

const translations: Record<Locale, Translations> = { en, ar }

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocaleState(saved)
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const value: I18nContextType = {
    locale,
    setLocale,
    t: translations[locale],
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  }

  if (!mounted) {
    return null
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
