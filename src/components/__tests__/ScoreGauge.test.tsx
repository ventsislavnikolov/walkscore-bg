import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LocaleProvider } from '../../lib/i18n'
import { ScoreGauge } from '../ScoreGauge'

describe('ScoreGauge', () => {
  it('renders the rounded score and english labels', () => {
    const { container } = render(
      <LocaleProvider locale="en">
        <ScoreGauge score={87.6} type="walk" />
      </LocaleProvider>,
    )

    expect(screen.getByText('88')).toBeInTheDocument()
    expect(screen.getByText('Walk Score')).toBeInTheDocument()
    expect(screen.getByText('Very Walkable')).toBeInTheDocument()
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('renders Bulgarian status text for smaller sizes', () => {
    render(
      <LocaleProvider locale="bg">
        <ScoreGauge score={55} type="transit" size="md" />
      </LocaleProvider>,
    )

    expect(screen.getByText('Transit Score')).toBeInTheDocument()
    expect(screen.getByText('Добър транспорт')).toBeInTheDocument()
  })
})
