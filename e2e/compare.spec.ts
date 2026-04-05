import { expect, test } from '@playwright/test'

import { waitForHydration } from './helpers'

test.describe('Compare Page', () => {
  test('compares two Sofia addresses and surfaces a winner', async ({ page }) => {
    await page.goto('/compare')
    await waitForHydration(page)

    await page.getByPlaceholder('Адрес 1').fill('кв. Лозенец')
    await page.getByPlaceholder('Адрес 2').fill('ж.к. Люлин')
    await page.getByRole('button', { name: 'Сравни' }).click()

    await waitForHydration(page)
    await expect(page.getByRole('heading', { level: 2, name: 'Lozenets, Sofia' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Lyulin, Sofia' })).toBeVisible()
    await expect(page.getByText('По-добър')).toBeVisible()
  })
})
