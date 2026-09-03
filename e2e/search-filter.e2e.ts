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

  test('facet filters narrow the rows and clear restores them', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    await page.getByRole('button', { name: /^Enabled/u }).click()
    await page.getByRole('menuitemcheckbox', { name: /^Disabled/u }).click()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toHaveCount(0)

    await page.getByRole('button', { name: /Clear/u }).click()

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

  test('Gates is the first tab and the default view', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await mockApi(page, defaultRoutes())
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    const tabs = page.getByRole('tab')
    await expect(tabs.first()).toHaveText(/Gates/iu)
    await expect(page.getByRole('tab', { name: /Gates/iu })).toHaveAttribute('data-state', 'active')
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
  })

  test('search and facet filters survive switching tabs', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    const search = page.getByPlaceholder(/Search .* by name/iu)
    await search.fill('checkout')
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)

    await page.getByRole('tab', { name: /Experiments/iu }).click()
    await expect(page.getByText('homepage_hero_reorder')).toBeVisible()
    await page.getByRole('tab', { name: /Gates/iu }).click()

    await expect(search).toHaveValue('checkout')
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)

    await search.locator('..').locator('button').click()
    await expect(search).toHaveValue('')

    await page.getByRole('button', { name: /^Enabled/u }).click()
    await page.getByRole('menuitemcheckbox', { name: /^Disabled/u }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toHaveCount(0)

    await page.getByRole('tab', { name: /Experiments/iu }).click()
    await expect(page.getByText('homepage_hero_reorder')).toBeVisible()
    await page.getByRole('tab', { name: /Gates/iu }).click()

    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Clear/u })).toBeVisible()
  })

  test('audit log search filters the visible entries', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await mockApi(page, defaultRoutes())
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    await page.getByRole('tab', { name: /Audit Logs/iu }).click()
    await expect(page.getByText('new_checkout_flow').first()).toBeVisible()

    await page.getByPlaceholder(/Search audit logs/iu).fill('nonexistent_log_xyz')
    await expect(page.getByText('No results found')).toBeVisible()

    await page.getByPlaceholder(/Search audit logs/iu).fill('checkout')
    await expect(page.getByText('new_checkout_flow').first()).toBeVisible()
  })

  test('search survives reopening the popup', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGatesTab(page, extensionId)

    await page.getByPlaceholder(/Search .* by name/iu).fill('checkout')
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)

    await page.reload()
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    await expect(page.getByPlaceholder(/Search .* by name/iu)).toHaveValue('checkout')
    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toHaveCount(0)
  })
})
