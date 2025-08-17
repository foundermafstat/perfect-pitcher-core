"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { translations, getTranslation } from '@/lib/translations/index'
import { getAIrineData, formatString } from '@/lib/airine-data'

type TranslationValue = string | { [key: string]: TranslationValue }

type Translations = {
  [key: string]: TranslationValue
}

type TranslationsContextType = {
  t: (key: string, variables?: Record<string, string | number>) => string
  locale: string
  setLocale: (locale: string) => void
  airineData: ReturnType<typeof getAIrineData>
  has: (key: string) => boolean
}

const TranslationsContext = createContext<TranslationsContextType | null>(null)

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en')
  const [airineData, setAirineData] = useState(getAIrineData('en'));
  const router = useRouter()
  
  // Инициализируем локаль из cookies при загрузке
  useEffect(() => {
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] || 'en';
    
    if (savedLocale !== locale) {
      setLocale(savedLocale);
      setAirineData(getAIrineData(savedLocale));
    }
    // has() moved outside useEffect
  }, []);
  
  const has = (key: string): boolean => {
    const keys = key.split('.')
    const resolve = (dict: Translations | TranslationValue, path: string[]): string | undefined => {
      let current: any = dict
      for (const p of path) {
        if (current == null || typeof current !== 'object') return undefined
        current = current[p]
      }
      return typeof current === 'string' ? current : undefined
    }
    return (
      resolve(getTranslation(locale), keys) !== undefined ||
      resolve(getTranslation('en'), keys) !== undefined
    )
  }

  // Обновляем airineData при изменении локали
  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    setAirineData(getAIrineData(newLocale));
    
    // Сохраняем локаль в cookies
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Перезагружаем серверные компоненты (включая боковое меню)
    router.refresh();
  }

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.')
    const resolve = (dict: Translations | TranslationValue, path: string[]): string | undefined => {
      let current: any = dict
      for (const p of path) {
        if (current == null || typeof current !== 'object') return undefined
        current = current[p]
      }
      return typeof current === 'string' ? current : undefined
    }

    // Try current locale first
    let result = resolve(getTranslation(locale), keys)

    // Fallback to English if missing
    if (result === undefined) {
      result = resolve(getTranslation('en'), keys)
      if (result === undefined) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[i18n] Missing translation for key "${key}" in locale "${locale}"`)
        }
        // As a last resort, return the last segment of the key to avoid showing full keys in UI
        result = keys[keys.length - 1]
      }
    }

    // Если есть переменные для форматирования строки
    if (variables && typeof result === 'string') {
      return formatString(result, variables)
    }
    
    return result
  }

  return (
    <TranslationsContext.Provider value={{ t, locale, setLocale: handleLocaleChange, airineData, has }}>
      {children}
    </TranslationsContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationsContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider')
  }
  return context
} 