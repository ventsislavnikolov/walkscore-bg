import { useTranslation } from '../lib/i18n'

export function Footer() {
  const { t, locale } = useTranslation()
  const prefix = locale === 'en' ? '/en' : ''

  return (
    <footer className="border-t border-stone-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-sm text-stone-500 md:flex-row md:justify-between">
          <div className="font-medium text-stone-900">
            Walk Score<span className="text-emerald-600">.bg</span>
          </div>

          <div className="flex gap-6">
            <a href={`${prefix}/about`} className="transition-colors hover:text-stone-900">
              {t('footer.about')}
            </a>
            <a href={`${prefix}/about`} className="transition-colors hover:text-stone-900">
              {t('footer.methodology')}
            </a>
            <span>{t('footer.data')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
