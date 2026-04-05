import { createFileRoute } from '@tanstack/react-router'

import { setLocale } from '../../lib/i18n'
import { ScorePage } from '../score'

export const Route = createFileRoute('/en/score')({
  validateSearch: (search: Record<string, unknown>) => ({
    address: typeof search.address === 'string' ? search.address : '',
    lat: typeof search.lat === 'string' ? Number(search.lat) : undefined,
    lng: typeof search.lng === 'string' ? Number(search.lng) : undefined,
  }),
  beforeLoad: () => {
    setLocale('en')
  },
  component: ScorePage,
})
