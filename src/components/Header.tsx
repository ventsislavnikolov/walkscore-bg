import { GitCompare, Info, Map } from 'lucide-react'

import { setLocale, useTranslation } from '../lib/i18n'
import type { Locale } from '../lib/types'

function localePrefix(locale: Locale) {
  return locale === 'en' ? '/en' : ''
}

export function Header() {
  const { t, locale } = useTranslation()
  const prefix = localePrefix(locale)

  function toggleLocale() {
    const nextLocale: Locale = locale === 'bg' ? 'en' : 'bg'
    setLocale(nextLocale)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href={`${prefix}/`} className="text-xl font-bold text-stone-900">
          Walk Score<span className="text-emerald-600">.bg</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href={`${prefix}/map`}
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            <Map size={16} />
            {t('nav.map')}
          </a>
          <a
            href={`${prefix}/compare`}
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            <GitCompare size={16} />
            {t('nav.compare')}
          </a>
          <a
            href={`${prefix}/about`}
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            <Info size={16} />
            {t('nav.about')}
          </a>
        </nav>

        <button
          type="button"
          onClick={toggleLocale}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
        >
          {t('footer.language')}
        </button>
      </div>
    </header>
  )
}
