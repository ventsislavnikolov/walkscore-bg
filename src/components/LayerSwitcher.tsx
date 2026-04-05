import clsx from 'clsx'

import { useTranslation } from '../lib/i18n'
import type { ScoreType } from '../lib/types'

interface LayerSwitcherProps {
  active: ScoreType
  onChange: (type: ScoreType) => void
}

const LAYERS: Array<{ type: ScoreType; key: string }> = [
  { type: 'walk', key: 'map.walk' },
  { type: 'transit', key: 'map.transit' },
  { type: 'bike', key: 'map.bike' },
]

export function LayerSwitcher({ active, onChange }: LayerSwitcherProps) {
  const { t } = useTranslation()

  return (
    <div className="inline-flex rounded-2xl bg-white/90 p-1.5 shadow-lg shadow-stone-900/10 ring-1 ring-stone-200/80 backdrop-blur-sm">
      {LAYERS.map(({ type, key }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={clsx(
            'rounded-xl px-3 py-1.5 text-sm font-medium transition-all',
            active === type
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
          )}
        >
          {t(key)}
        </button>
      ))}
    </div>
  )
}
