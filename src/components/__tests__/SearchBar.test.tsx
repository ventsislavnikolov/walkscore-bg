import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    setLocale('bg')
  })

  it('calls onSearch when provided instead of navigating', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    fireEvent.change(screen.getByPlaceholderText('ул. Витошка 42, София'), {
      target: { value: 'Lozenets' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Провери' }).closest('form')!)

    expect(onSearch).toHaveBeenCalledWith('Lozenets')
  })

  it('navigates to the localized score route', () => {
    setLocale('en')
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    })

    render(<SearchBar />)

    fireEvent.change(screen.getByPlaceholderText('ul. Vitoshka 42, Sofia'), {
      target: { value: 'Sofia Center' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Check' }).closest('form')!)

    expect(assign).toHaveBeenCalledWith('/en/score?address=Sofia+Center')
  })
})
