import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { localeStore, setLocale, useLocale, useTranslation } from '../i18n'

describe('localeStore', () => {
  beforeEach(() => {
    setLocale('bg')
  })

  it('defaults to Bulgarian and allows switching to English', () => {
    expect(localeStore.state).toBe('bg')
    act(() => {
      setLocale('en')
    })
    expect(localeStore.state).toBe('en')
  })

  it('exposes the current locale through useLocale', () => {
    const { result, rerender } = renderHook(() => useLocale())
    expect(result.current).toBe('bg')

    act(() => {
      setLocale('en')
    })
    rerender()

    expect(result.current).toBe('en')
  })
})

describe('useTranslation', () => {
  beforeEach(() => {
    setLocale('bg')
  })

  it('returns localized strings', () => {
    const { result, rerender } = renderHook(() => useTranslation())
    expect(result.current.t('hero.button')).toBe('Провери')

    act(() => {
      setLocale('en')
    })
    rerender()

    expect(result.current.t('hero.button')).toBe('Check')
  })

  it('falls back to the translation key when a string is missing', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('missing.key')).toBe('missing.key')
  })

  it('interpolates parameters into translated strings', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.t('city.title', { city: 'София' })).toBe('Walk Score на София')
  })
})
