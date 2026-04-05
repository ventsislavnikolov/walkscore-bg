import { describe, expect, it } from 'vitest'

import { scoreBgClass, scoreColor, scoreColorClass } from '../colors'

describe('scoreColor', () => {
  it('maps each range to the expected hex color', () => {
    expect(scoreColor(95)).toBe('#059669')
    expect(scoreColor(75)).toBe('#34d399')
    expect(scoreColor(55)).toBe('#fbbf24')
    expect(scoreColor(30)).toBe('#f97316')
    expect(scoreColor(10)).toBe('#dc2626')
  })
})

describe('scoreColorClass', () => {
  it('maps each range to the expected text class', () => {
    expect(scoreColorClass(95)).toBe('text-emerald-600')
    expect(scoreColorClass(75)).toBe('text-emerald-500')
    expect(scoreColorClass(55)).toBe('text-amber-500')
    expect(scoreColorClass(30)).toBe('text-orange-500')
    expect(scoreColorClass(10)).toBe('text-red-600')
  })
})

describe('scoreBgClass', () => {
  it('maps each range to the expected background class', () => {
    expect(scoreBgClass(95)).toBe('bg-emerald-600')
    expect(scoreBgClass(75)).toBe('bg-emerald-500')
    expect(scoreBgClass(55)).toBe('bg-amber-500')
    expect(scoreBgClass(30)).toBe('bg-orange-500')
    expect(scoreBgClass(10)).toBe('bg-red-600')
  })
})
