import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { Header } from '../Header'

describe('Header', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/score?address=Sofia')
  })

  it('renders Bulgarian navigation by default', () => {
    setLocale('bg')
    render(<Header />)

    expect(screen.getByRole('link', { name: /Walk Score/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute('href', '/map')
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('switches locale and prefixes paths when toggled', () => {
    setLocale('bg')
    render(<Header />)

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(window.location.pathname).toBe('/en/score')
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute('href', '/en/map')
    expect(screen.getByRole('button', { name: 'Български' })).toBeInTheDocument()
  })
})
