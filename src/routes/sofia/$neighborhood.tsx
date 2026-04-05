import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { HeatmapMap } from '../../components/HeatmapMap'
import { ScoreTriple } from '../../components/ScoreTriple'
import { useTranslation } from '../../lib/i18n'
import { getSupabase } from '../../server/supabase'

const getNeighborhoodData = createServerFn({ method: 'GET' })
  .inputValidator((data: { neighborhood: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getSupabase()
      const { data: city } = await supabase.from('ws_cities').select('*').eq('slug', 'sofia').single()

      return {
        neighborhood: data.neighborhood,
        city,
      }
    } catch {
      return {
        neighborhood: data.neighborhood,
        city: null,
      }
    }
  })

export const Route = createFileRoute('/sofia/$neighborhood')({
  loader: ({ params }) =>
    getNeighborhoodData({ data: { neighborhood: params.neighborhood } }),
  component: NeighborhoodPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Walk Score - ${loaderData?.neighborhood} | WalkScore.bg`,
      },
      {
        name: 'description',
        content: `Walk Score, Transit Score and Bike Score for ${loaderData?.neighborhood}, Sofia.`,
      },
    ],
  }),
})

export function NeighborhoodPage() {
  const { neighborhood, city } = Route.useLoaderData()
  const { locale } = useTranslation()

  const displayName = neighborhood
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/sofia"
          className="mb-4 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-emerald-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50"
        >
          {locale === 'bg' ? '← София' : '← Sofia'}
        </Link>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-b border-stone-200 px-8 py-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-stone-400">
              Neighborhood
            </p>
            <h1 className="mt-3 text-3xl font-bold text-stone-900">{displayName}</h1>
          </div>

          {city ? (
            <div className="px-8 py-8">
              <ScoreTriple
                walkScore={city.avg_walk_score}
                transitScore={city.avg_transit_score}
                bikeScore={city.avg_bike_score}
                size="md"
              />
            </div>
          ) : (
            <p className="px-8 py-8 text-stone-600">
              {locale === 'bg' ? 'Няма налични данни за този район.' : 'No data is available for this area yet.'}
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="h-[420px]">
            <HeatmapMap
              center={[city?.center_lng ?? 23.3219, city?.center_lat ?? 42.6977]}
              zoom={14}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
