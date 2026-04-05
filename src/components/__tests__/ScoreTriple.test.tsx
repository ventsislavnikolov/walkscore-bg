import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { ScoreTriple } from '../ScoreTriple'

describe('ScoreTriple', () => {
  it('renders three score gauges together', () => {
    setLocale('en')
    render(<ScoreTriple walkScore={87} transitScore={72} bikeScore={45} size="sm" />)

    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('Walk Score')).toBeInTheDocument()
    expect(screen.getByText('Transit Score')).toBeInTheDocument()
    expect(screen.getByText('Bike Score')).toBeInTheDocument()
  })
})
