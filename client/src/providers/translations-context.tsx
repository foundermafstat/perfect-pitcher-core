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
  }, []);
  
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
    let value: TranslationValue = getTranslation(locale)
    
    for (const k of keys) {
      if (value === undefined) return key
      value = typeof value === 'object' ? value[k] : key
    }

    const result = typeof value === 'string' ? value : key
    
    // Если есть переменные для форматирования строки
    if (variables && typeof result === 'string') {
      return formatString(result, variables)
    }
    
    return result
  }

  return (
    <TranslationsContext.Provider value={{ t, locale, setLocale: handleLocaleChange, airineData }}>
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