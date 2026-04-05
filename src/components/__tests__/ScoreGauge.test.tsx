import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setLocale } from '../../lib/i18n'
import { ScoreGauge } from '../ScoreGauge'

describe('ScoreGauge', () => {
  it('renders the rounded score and english labels', () => {
    setLocale('en')
    const { container } = render(<ScoreGauge score={87.6} type="walk" />)

    expect(screen.getByText('88')).toBeInTheDocument()
    expect(screen.getByText('Walk Score')).toBeInTheDocument()
    expect(screen.getByText('Very Walkable')).toBeInTheDocument()
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('renders Bulgarian status text for smaller sizes', () => {
    setLocale('bg')
    render(<ScoreGauge score={55} type="transit" size="md" />)

    expect(screen.getByText('Transit Score')).toBeInTheDocument()
    expect(screen.getByText('Добър транспорт')).toBeInTheDocument()
  })
})
