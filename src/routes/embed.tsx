import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { useLocale } from '../lib/i18n'

export const Route = createFileRoute('/embed')({
  component: EmbedPage,
})

export function EmbedPage() {
  const locale = useLocale()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lang, setLang] = useState<'bg' | 'en'>(locale)

  const embedUrl = `https://walkscore.bg/embed?lat=42.6977&lng=23.3219&theme=${theme}&lang=${lang}`
  const embedCode = `<iframe src="${embedUrl}" width="350" height="200" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e5e5;"></iframe>`
  const isDark = theme === 'dark'

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-b border-stone-200 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)] px-8 py-8">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Publisher Kit
            </p>
            <h1 className="text-3xl font-bold text-stone-900">Embed Widget</h1>
            <p className="mt-3 max-w-2xl text-stone-600">
              Add WalkScore.bg summaries to listings, neighborhood guides, and market reports.
            </p>
          </div>

          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-stone-900">Preview</h2>
              <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-6">
                <div
                  className={`mx-auto w-full max-w-[350px] rounded-[1.5rem] border px-5 py-5 ${
                    isDark
                      ? 'border-stone-700 bg-stone-950 text-white'
                      : 'border-stone-200 bg-white text-stone-900'
                  }`}
                >
                  <div className="mb-4 text-sm opacity-70">
                    {lang === 'bg' ? 'Център, София' : 'Sofia Center'}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <ScoreChip label="Walk" value={87} tone="emerald" dark={isDark} />
                    <ScoreChip label="Transit" value={72} tone="emerald-soft" dark={isDark} />
                    <ScoreChip label="Bike" value={45} tone="amber" dark={isDark} />
                  </div>
                  <div className="mt-4 text-center text-xs opacity-55">Powered by WalkScore.bg</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-stone-900">Options</h2>
              <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
                <OptionField label="Theme">
                  <select
                    value={theme}
                    onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </OptionField>

                <OptionField label="Language">
                  <select
                    value={lang}
                    onChange={(event) => setLang(event.target.value as 'bg' | 'en')}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="bg">Bulgarian</option>
                    <option value="en">English</option>
                  </select>
                </OptionField>
              </div>

              <h2 className="mb-3 mt-6 text-lg font-semibold text-stone-900">Embed Code</h2>
              <pre className="overflow-x-auto rounded-[1.5rem] bg-stone-950 p-4 text-sm text-stone-100">
                {embedCode}
              </pre>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Copy code
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

interface OptionFieldProps {
  label: string
  children: React.ReactNode
}

function OptionField({ label, children }: OptionFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-stone-600">{label}</label>
      {children}
    </div>
  )
}

interface ScoreChipProps {
  label: string
  value: number
  tone: 'emerald' | 'emerald-soft' | 'amber'
  dark: boolean
}

function ScoreChip({ label, value, tone, dark }: ScoreChipProps) {
  const toneClass =
    tone === 'emerald'
      ? dark
        ? 'text-emerald-300'
        : 'text-emerald-600'
      : tone === 'emerald-soft'
        ? dark
          ? 'text-emerald-200'
          : 'text-emerald-500'
        : dark
          ? 'text-amber-300'
          : 'text-amber-500'

  return (
    <div>
      <div className={`text-3xl font-bold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.18em] opacity-60">{label}</div>
    </div>
  )
}
