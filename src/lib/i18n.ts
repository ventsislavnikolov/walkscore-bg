import { createContext, createElement, useContext } from 'react'

import bg from '../locales/bg.json'
import en from '../locales/en.json'
import type { Locale } from './types'

const translations = { bg, en } as const

const LocaleContext = createContext<Locale>('bg')

export function setLocale(locale: Locale) {
  if (typeof window === 'undefined') return

  const path = window.location.pathname
  const search = window.location.search
  const hash = window.location.hash
  const nextPath =
    locale === 'en'
      ? path.startsWith('/en')
        ? path
        : `/en${path === '/' ? '' : path}`
      : path.startsWith('/en')
        ? path.replace(/^\/en/, '') || '/'
        : path

  window.location.assign(`${nextPath}${search}${hash}`)
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'bg'
}

export function LocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) {
  return createElement(LocaleContext.Provider, { value: locale }, children)
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
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
