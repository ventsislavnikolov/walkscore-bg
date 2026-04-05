import { useState } from 'react'
import { MapPin } from 'lucide-react'

import { useLocale, useTranslation } from '../lib/i18n'

interface SearchBarProps {
  size?: 'lg' | 'md'
  defaultValue?: string
  onSearch?: (address: string) => void
}

export function SearchBar({ size = 'lg', defaultValue = '', onSearch }: SearchBarProps) {
  const [address, setAddress] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const locale = useLocale()
  const prefix = locale === 'en' ? '/en' : ''
  const isLarge = size === 'lg'

  function navigateToScore(nextAddress: string) {
    const params = new URLSearchParams({ address: nextAddress })
    window.location.assign(`${prefix}/score?${params.toString()}`)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextAddress = address.trim()

    if (!nextAddress) return

    if (onSearch) {
      onSearch(nextAddress)
      return
    }

    if (typeof window === 'undefined') return

    setLoading(true)
    navigateToScore(nextAddress)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <MapPin
          size={isLarge ? 20 : 16}
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 ${isLarge ? '' : 'h-4 w-4'}`}
        />
        <input
          data-testid="search-input"
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder={t('hero.placeholder')}
          className={`w-full rounded-2xl border-2 border-stone-200 bg-white outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
            isLarge
              ? 'py-5 pl-12 pr-32 text-lg shadow-lg shadow-stone-200/50'
              : 'py-3 pl-10 pr-24 text-sm shadow-sm'
          }`}
        />
        <button
          data-testid="search-submit"
          type="submit"
          disabled={loading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-600 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 ${
            isLarge ? 'px-6 py-3' : 'px-4 py-2 text-sm'
          }`}
        >
          {loading ? t('hero.buttonLoading') : t('hero.button')}
        </button>
      </div>
    </form>
  )
}
