import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LocaleProvider } from '../../lib/i18n'
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
    render(
      <LocaleProvider locale="bg">
        <CategoryBreakdown components={components} />
      </LocaleProvider>,
    )

    expect(screen.getByText('Хранителни')).toBeInTheDocument()
    expect(screen.getByText('Ресторанти')).toBeInTheDocument()
    expect(screen.getByText('Образование')).toBeInTheDocument()
  })

  it('renders English labels when locale changes', () => {
    render(
      <LocaleProvider locale="en">
        <CategoryBreakdown components={components} />
      </LocaleProvider>,
    )

    expect(screen.getByText('Grocery')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
  })
})
