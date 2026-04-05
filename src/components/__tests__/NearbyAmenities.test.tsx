import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { NearbyAmenities } from '../NearbyAmenities'

const amenities = [
  { id: 1, category: 'grocery', name: 'Billa', nameBg: 'Билла', distanceM: 120, lng: 23.32, lat: 42.69 },
  { id: 2, category: 'restaurant', name: 'Happy', nameBg: 'Хепи', distanceM: 240, lng: 23.33, lat: 42.7 },
]

describe('NearbyAmenities', () => {
  it('renders localized category groups', () => {
    setLocale('bg')
    render(<NearbyAmenities amenities={amenities} />)

    expect(screen.getByText('Наблизо')).toBeInTheDocument()
    expect(screen.getByText('Хранителни')).toBeInTheDocument()
    expect(screen.getByText('Ресторанти')).toBeInTheDocument()
  })

  it('forwards selection callbacks', () => {
    setLocale('en')
    const onSelect = vi.fn()
    render(<NearbyAmenities amenities={amenities} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: /Billa/i }))
    expect(onSelect).toHaveBeenCalledWith(amenities[0])
  })
})
