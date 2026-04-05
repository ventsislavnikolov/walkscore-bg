import { useLocale, useTranslation } from '../lib/i18n'
import { CATEGORY_META } from '../lib/labels'
import type { Amenity } from '../lib/types'

interface NearbyAmenitiesProps {
  amenities: Amenity[]
  onSelect?: (amenity: Amenity) => void
}

export function NearbyAmenities({ amenities, onSelect }: NearbyAmenitiesProps) {
  const locale = useLocale()
  const { t } = useTranslation()

  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = []
    }
    acc[amenity.category].push(amenity)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-stone-900">{t('score.nearbyTitle')}</h3>

      {Object.entries(grouped).map(([category, items]) => {
        const meta = CATEGORY_META[category]
        if (!meta) return null

        return (
          <div key={category}>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700">
              <span>{meta.icon}</span>
              <span>{locale === 'bg' ? meta.bg : meta.en}</span>
            </div>

            <div className="space-y-1.5">
              {items.slice(0, 5).map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => onSelect?.(amenity)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-stone-100"
                >
                  <span className="truncate pr-3 text-stone-700">
                    {(locale === 'bg' ? amenity.nameBg : amenity.name) || amenity.name || amenity.nameBg}
                  </span>
                  <span className="shrink-0 text-stone-400">{amenity.distanceM}m</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
