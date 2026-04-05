import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { HeatmapMap } from '../../components/HeatmapMap'
import { ScoreTriple } from '../../components/ScoreTriple'
import { useTranslation } from '../../lib/i18n'
import { getSupabase } from '../../server/supabase'

const getCityData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = getSupabase()
    const { data: city } = await supabase.from('ws_cities').select('*').eq('slug', 'sofia').single()

    return { city }
  } catch {
    return { city: null }
  }
})

export const Route = createFileRoute('/sofia/')({
  loader: () => getCityData(),
  component: SofiaCityPage,
})

export function SofiaCityPage() {
  const { city } = Route.useLoaderData()
  const { t, locale } = useTranslation()

  if (!city) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <h1 className="text-3xl font-bold text-stone-900">Sofia</h1>
          <p className="mt-4 text-stone-600">{t('errors.noData')}</p>
        </div>
      </main>
    )
  }

  const cityName = locale === 'bg' ? city.name_bg : city.name_en

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-b border-stone-200 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)] px-8 py-8">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              City Profile
            </p>
            <h1 className="text-3xl font-bold text-stone-900">
              {t('city.title', { city: cityName })}
            </h1>
            <p className="mt-3 text-stone-600">{t('city.avgScores')}</p>
          </div>

          <div className="px-8 py-8">
            <ScoreTriple
              walkScore={city.avg_walk_score}
              transitScore={city.avg_transit_score}
              bikeScore={city.avg_bike_score}
              size="lg"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="h-[440px]">
            <HeatmapMap center={[city.center_lng, city.center_lat]} zoom={12} />
          </div>
        </section>
      </div>
    </main>
  )
}
