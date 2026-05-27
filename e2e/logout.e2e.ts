import type { Page } from '@playwright/test'

import type { MockRoute } from './mocks'

import { expect, test } from './fixtures'
import { mockAuditLogs, mockDynamicConfigs, mockExperiments, mockFeatureGates, paginated } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const STORAGE_KEY = 'statsig-console-api-key'

const defaultRoutes = (): MockRoute[] => [
  { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
  { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
  { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
  { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
]

const openAuthenticated = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, defaultRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
}

const openHeaderDropdown = async (page: Page): Promise<void> => {
  // The header dropdown trigger is the first Settings icon button, before the dropdown items render.
  await page.locator('header button').last().click()
}

test.describe('logout flow', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('clicking logout reopens the login modal', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await openHeaderDropdown(page)
    await page.getByRole('menuitem', { name: /Logout/iu }).click()

    await expect(page.getByText('Login to Statsig')).toBeVisible()
  })

  test('logout clears the stored api key', async ({ context, extensionId, serviceWorker }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await openHeaderDropdown(page)
    await page.getByRole('menuitem', { name: /Logout/iu }).click()
    await expect(page.getByText('Login to Statsig')).toBeVisible()

    const stored = await serviceWorker.evaluate(
      (key) =>
        new Promise<unknown>((resolve) => {
          chrome.storage.local.get(key, (items) => {
            resolve((items as Record<string, unknown>)[key])
          })
        }),
      STORAGE_KEY,
    )

    // UseLogout calls setApiKey('') — either the empty string or no entry counts as cleared.
    expect(stored === '' || stored === undefined).toBe(true)
  })

  test('login modal exposes the api key input after logout', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await openHeaderDropdown(page)
    await page.getByRole('menuitem', { name: /Logout/iu }).click()

    await expect(page.getByLabel(/Statsig Console API Key/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Login/iu })).toBeVisible()
  })
})
