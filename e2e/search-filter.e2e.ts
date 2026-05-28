import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'
import { defaultRoutes } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const openOnGatesTab = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, defaultRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
  await page.getByRole('tab', { name: /Gates/iu }).click()
  await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
  await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toBeVisible()
}

test.describe('search and filter', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('typing in search filters the visible rows', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    await page.getByPlaceholder(/Search .* by name/iu).fill('checkout')

    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)
  })

  test('clear button restores all rows', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    const search = page.getByPlaceholder(/Search .* by name/iu)
    await search.fill('checkout')
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)

    // TopContentSearch renders a clear button (X icon) when filterValue is non-empty.
    await search.locator('..').locator('button').click()

    await expect(search).toHaveValue('')
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toBeVisible()
  })

  test('search with no matches yields zero rows', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    await page.getByPlaceholder(/Search .* by name/iu).fill('nonexistent_gate_xyz')

    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toHaveCount(0)
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)
  })
})
