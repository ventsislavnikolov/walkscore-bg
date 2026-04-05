import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ShareEmbed } from '../ShareEmbed'

describe('ShareEmbed', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders copy actions', () => {
    render(<ShareEmbed lat={42.69} lng={23.32} />)

    expect(screen.getByText('Копирай линк')).toBeInTheDocument()
    expect(screen.getByText('Embed код')).toBeInTheDocument()
  })

  it('copies the share URL to the clipboard', async () => {
    render(<ShareEmbed lat={42.69} lng={23.32} />)

    await act(async () => {
      fireEvent.click(screen.getByText('Копирай линк'))
      await Promise.resolve()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://walkscore.bg/score?lat=42.69&lng=23.32',
    )
  })

  it('copies the embed snippet when requested', async () => {
    render(<ShareEmbed lat={42.69} lng={23.32} />)

    await act(async () => {
      fireEvent.click(screen.getByText('Embed код'))
      await Promise.resolve()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('https://walkscore.bg/embed?lat=42.69&lng=23.32'),
    )
  })
})
