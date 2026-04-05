import { expect, test } from '@playwright/test'

import { waitForHydration } from './helpers'

test.describe('Mobile Experience', () => {
  test('keeps the home search flow usable on mobile', async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Walk Score')
    await expect(page.getByTestId('search-input')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Провери' })).toBeVisible()

    await page.getByTestId('search-input').fill('ул. Граф Игнатиев')
    await page.getByTestId('search-submit').click()

    await expect(page).toHaveURL(/\/score\?address=/)
    await waitForHydration(page)
    await expect(page.getByRole('button', { name: 'Копирай линк' })).toBeVisible()
  })
})
