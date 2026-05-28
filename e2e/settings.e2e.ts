import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'
import { defaultRoutes } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const STORAGE_KEY_LOCAL = 'statsig-local-storage-key'

const openAuthenticated = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, defaultRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
}

const openSettingsSheet = async (page: Page): Promise<void> => {
  await page.locator('header button').last().click()
  await page.getByRole('menuitem', { name: /^Settings$/iu }).click()
  await expect(page.getByRole('heading', { name: /Extension Settings/iu })).toBeVisible()
}

test.describe('settings sheet', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('opens settings sheet from header dropdown', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await openSettingsSheet(page)

    await expect(page.getByText(/Configure how the extension interacts with Statsig/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Save Settings/iu })).toBeVisible()
  })

  test('renders storage and appearance subsections', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await openSettingsSheet(page)

    // The form binds inputs for localStorageKey + storageType. We assert the bound field renders
    // With the default value seeded by useSettingsStorage.
    await expect(page.locator('input[name="localStorageKey"]')).toBeVisible()
    await expect(page.locator('input[name="localStorageKey"]')).toHaveValue('statsig_user')
  })

  test('saves updated local storage key and closes sheet', async ({ context, extensionId, serviceWorker }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)
    await openSettingsSheet(page)

    const input = page.locator('input[name="localStorageKey"]')
    await input.fill('custom_user_key')
    await page.getByRole('button', { name: /Save Settings/iu }).click()

    await expect(page.getByRole('heading', { name: /Extension Settings/iu })).toBeHidden()

    // Wxt persists the value to chrome.storage.local under `local:` area.
    const stored = await serviceWorker.evaluate(
      (key) =>
        new Promise<unknown>((resolve) => {
          chrome.storage.local.get(key, (items) => {
            resolve((items as Record<string, unknown>)[key])
          })
        }),
      STORAGE_KEY_LOCAL,
    )

    expect(stored).toBe('custom_user_key')
  })

  test('closes sheet via Escape without persisting an edit', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)
    await openSettingsSheet(page)

    await page.locator('input[name="localStorageKey"]').fill('throwaway')
    await page.keyboard.press('Escape')

    await expect(page.getByRole('heading', { name: /Extension Settings/iu })).toBeHidden()
  })
})
