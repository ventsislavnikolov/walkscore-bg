import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('uses localized about links', () => {
    setLocale('en')
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about')
    expect(screen.getByRole('link', { name: 'Methodology' })).toHaveAttribute(
      'href',
      '/en/about',
    )
  })
})
