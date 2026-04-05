import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { CategoryBreakdown } from '../CategoryBreakdown'

const components = {
  grocery: 95,
  restaurant: 88,
  shopping: 70,
  errands: 92,
  parks: 65,
  education: 80,
}

describe('CategoryBreakdown', () => {
  it('renders Bulgarian category labels by default', () => {
    setLocale('bg')
    render(<CategoryBreakdown components={components} />)

    expect(screen.getByText('Хранителни')).toBeInTheDocument()
    expect(screen.getByText('Ресторанти')).toBeInTheDocument()
    expect(screen.getByText('Образование')).toBeInTheDocument()
  })

  it('renders English labels when locale changes', () => {
    setLocale('en')
    render(<CategoryBreakdown components={components} />)

    expect(screen.getByText('Grocery')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })
})
