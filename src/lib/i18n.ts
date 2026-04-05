import { Store, useStore } from '@tanstack/react-store'

import bg from '../locales/bg.json'
import en from '../locales/en.json'
import type { Locale } from './types'

const translations = { bg, en } as const

export const localeStore = new Store<Locale>('bg')

export function setLocale(locale: Locale) {
  localeStore.setState(() => locale)
}

export function useLocale(): Locale {
  return useStore(localeStore, (locale) => locale)
}

export function useTranslation() {
  const locale = useLocale()

  function t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.')
    let value: unknown = translations[locale]

    for (const segment of keys) {
      if (value && typeof value === 'object' && segment in value) {
        value = (value as Record<string, unknown>)[segment]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    if (!params) {
      return value
    }

    return Object.entries(params).reduce(
      (acc, [param, replacement]) => acc.replace(`{${param}}`, replacement),
      value,
    )
  }

  return { t, locale }
}
