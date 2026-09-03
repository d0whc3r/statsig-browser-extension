import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'
import { defaultRoutes } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const openAuthenticated = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, defaultRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
}

test.describe('user details sheet', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('opens from the header menu and shows the empty detection state', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.locator('header button').last().click()
    await page.getByRole('menuitem', { name: /User Details/iu }).click()

    await expect(page.getByRole('heading', { name: /User Details/iu })).toBeVisible()
    await expect(page.getByText(/couldn't detect a Statsig user/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Try Again/iu })).toBeVisible()
  })

  test('closes the user details sheet with Escape', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.locator('header button').last().click()
    await page.getByRole('menuitem', { name: /User Details/iu }).click()
    await expect(page.getByRole('heading', { name: /User Details/iu })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: /User Details/iu })).toHaveCount(0)
  })
})
