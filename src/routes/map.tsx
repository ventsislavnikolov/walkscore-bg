import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { HeatmapMap } from '../components/HeatmapMap'
import { LayerSwitcher } from '../components/LayerSwitcher'
import { ScoreLegend } from '../components/ScoreLegend'
import { SearchBar } from '../components/SearchBar'
import { useTranslation } from '../lib/i18n'
import type { ScoreType } from '../lib/types'

export const Route = createFileRoute('/map')({
  component: MapPage,
})

export function MapPage() {
  const { t } = useTranslation()
  const [scoreType, setScoreType] = useState<ScoreType>('walk')

  return (
    <main className="relative h-[calc(100vh-3.5rem)] overflow-hidden bg-stone-950">
      <HeatmapMap
        center={[23.3219, 42.6977]}
        zoom={12}
        scoreType={scoreType}
        className="h-full w-full"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-4">
        <div className="pointer-events-auto w-full max-w-5xl rounded-[2rem] border border-white/55 bg-white/88 p-3 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-3">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Sofia Atlas
                </p>
                <h1 className="text-xl font-semibold text-stone-900 md:text-2xl">
                  {t('map.title')}
                </h1>
              </div>
              <SearchBar size="md" />
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <LayerSwitcher active={scoreType} onChange={setScoreType} />
              <div className="hidden md:block">
                <ScoreLegend />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 md:hidden">
        <ScoreLegend />
      </div>
    </main>
  )
}
