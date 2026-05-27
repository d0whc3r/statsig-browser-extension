import type { Page } from '@playwright/test'

import type { MockRoute } from './mocks'

import { expect, test } from './fixtures'
import { mockAuditLogs, mockDynamicConfigs, mockExperiments, mockFeatureGates, paginated } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const defaultRoutes = (): MockRoute[] => [
  { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
  { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
  { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
  { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
]

const openPopup = async (page: Page, extensionId: string, routes: MockRoute[]): Promise<void> => {
  await mockApi(page, routes)
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
}

test.describe('authenticated popup', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('skips login modal when api key is seeded', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openPopup(page, extensionId, defaultRoutes())

    await expect(page.getByText('Login to Statsig')).toBeHidden()
  })

  test('renders feature gates from mocked api', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openPopup(page, extensionId, defaultRoutes())

    await page.getByRole('tab', { name: /Gates/iu }).click()

    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /dark_theme_enabled/u })).toBeVisible()
  })

  test('renders experiments from mocked api', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openPopup(page, extensionId, defaultRoutes())

    await page.getByRole('tab', { name: /Experiments/iu }).click()

    await expect(page.getByText('homepage_hero_reorder')).toBeVisible()
  })

  test('renders dynamic configs from mocked api', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openPopup(page, extensionId, defaultRoutes())

    await page.getByRole('tab', { name: /Configs/iu }).click()

    await expect(page.getByText('homepage_banner_config')).toBeVisible()
  })

  test('renders audit logs from mocked api', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openPopup(page, extensionId, defaultRoutes())

    await page.getByRole('tab', { name: /Audit Logs/iu }).click()

    await expect(page.getByText('new_checkout_flow').first()).toBeVisible()
  })

  test('shows empty state when api returns no data and actually calls /gates', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const mock = await mockApi(page, [
      { data: paginated([]), urlPattern: String.raw`/gates(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/experiments(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await page.getByRole('tab', { name: /Gates/iu }).click()

    await expect(page.getByRole('row', { name: /new_checkout_flow/u })).toHaveCount(0)
    await expect(page.getByText(/no .*(gates|results)/iu).first()).toBeVisible()

    const gateCalls = await mock.callsFor(/\/gates(\?|$)/u)
    expect(gateCalls.length).toBeGreaterThan(0)
    expect(gateCalls.every((call) => call.matched)).toBe(true)
  })
})
