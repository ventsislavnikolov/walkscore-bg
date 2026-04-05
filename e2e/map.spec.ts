import { expect, test } from '@playwright/test'

import { waitForHydration } from './helpers'

test.describe('Map Page', () => {
  test('renders the map shell and score layer controls', async ({ page }) => {
    await page.goto('/map')
    await waitForHydration(page)

    await expect(page.getByRole('heading', { level: 1, name: 'Карта на София' })).toBeVisible()
    await expect(page.getByTestId('search-input')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Пешеходен' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Транспорт' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Велосипеден' })).toBeVisible()
    await expect(page.getByTestId('heatmap-map')).toBeVisible()
  })
})
