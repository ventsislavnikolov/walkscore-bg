import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Map, MapPin } from 'lucide-react'

import { SearchBar } from '../components/SearchBar'
import { useTranslation } from '../lib/i18n'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const QUICK_LINKS = [
  { bg: 'ул. Граф Игнатиев', en: 'ul. Graf Ignatiev' },
  { bg: 'ж.к. Люлин', en: 'zh.k. Lyulin' },
  { bg: 'кв. Лозенец', en: 'kv. Lozenets' },
  { bg: 'Витоша', en: 'Vitosha' },
] as const

export function HomePage() {
  const { t, locale } = useTranslation()
  const localePrefix = locale === 'en' ? '/en' : ''

  return (
    <main className="min-h-[calc(100vh-7rem)]">
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_65%)]" />
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <span className="mb-6 rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm backdrop-blur">
            Sofia MVP
          </span>

          <h1 className="mb-5 text-center text-5xl font-bold tracking-tight text-stone-900 md:text-7xl">
            {t('hero.heading')}
            <span className="text-emerald-600">{t('hero.headingAccent')}</span>
          </h1>

          <p className="mb-10 max-w-2xl text-center text-lg leading-8 text-stone-600 md:text-xl">
            {t('hero.subheading')}
          </p>

          <div className="w-full max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-stone-500">
            <span>{t('hero.tryLabel')}</span>
            {QUICK_LINKS.map((link) => {
              const address = `${locale === 'bg' ? link.bg : link.en}, Sofia`
              const href = `${localePrefix}/score?${new URLSearchParams({ address }).toString()}`
              return (
                <a
                  key={link.bg}
                  href={href}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                >
                  {locale === 'bg' ? link.bg : link.en}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-stone-900">
            {t('howItWorks.title')}
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MapPin, key: 'step1' },
              { icon: BarChart3, key: 'step2' },
              { icon: Map, key: 'step3' },
            ].map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-3xl border border-stone-200 bg-stone-50 p-8 shadow-[0_24px_60px_-48px_rgba(68,64,60,0.45)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-stone-900">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="text-sm leading-7 text-stone-600">
                  {t(`howItWorks.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
