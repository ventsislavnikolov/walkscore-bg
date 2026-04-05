import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScoreLegend } from '../ScoreLegend'

describe('ScoreLegend', () => {
  it('renders all score stops', () => {
    render(<ScoreLegend />)

    for (const label of ['0', '25', '50', '70', '90+']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })
})
