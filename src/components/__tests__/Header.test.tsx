import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { LocaleProvider } from '../../lib/i18n'
import { Header } from '../Header'

describe('Header', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/score?address=Sofia')
  })

  it('renders Bulgarian navigation by default', () => {
    render(
      <LocaleProvider locale="bg">
        <Header />
      </LocaleProvider>,
    )

    expect(screen.getByRole('link', { name: /Walk Score/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute('href', '/map')
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('renders English-prefixed navigation when locale is English', () => {
    render(
      <LocaleProvider locale="en">
        <Header />
      </LocaleProvider>,
    )

    expect(screen.getByRole('link', { name: /Walk Score/i })).toHaveAttribute('href', '/en/')
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute('href', '/en/map')
    expect(screen.getByRole('button', { name: 'Български' })).toBeInTheDocument()
  })
})
