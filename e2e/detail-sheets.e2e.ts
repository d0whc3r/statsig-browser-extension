import type { Page } from '@playwright/test'

import type { MockRoute } from './mocks'

import { expect, test } from './fixtures'
import {
  emptyOverrides,
  mockAuditLogs,
  mockDynamicConfigs,
  mockExperiments,
  mockFeatureGates,
  paginated,
  single,
} from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const detailRoutes = (): MockRoute[] => [
  { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
  { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
  { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
  { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
  // Per-entity detail endpoints. Order matters: list patterns above are anchored
  // To `?` or end-of-string, so detail URLs (`/gates/:id`) cannot collide.
  { data: emptyOverrides, urlPattern: String.raw`/gates/[^/]+/overrides(\?|$)` },
  { data: single(mockFeatureGates[0]), urlPattern: String.raw`/gates/[^/]+(\?|$)` },
  { data: single(mockExperiments[0]), urlPattern: String.raw`/experiments/[^/]+(\?|$)` },
  { data: single(mockDynamicConfigs[0]), urlPattern: String.raw`/dynamic_configs/[^/]+(\?|$)` },
]

const openAuthenticated = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, detailRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
}

test.describe('detail sheets', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('clicking a feature gate row opens the gate sheet', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.getByRole('tab', { name: /Gates/iu }).click()
    await page.getByRole('row', { name: /new_checkout_flow/u }).click()

    // The sheet header repeats the entity name and shows status badges.
    const sheetTitle = page.getByRole('dialog').getByText('new_checkout_flow').first()
    await expect(sheetTitle).toBeVisible()
    await expect(page.getByRole('dialog').getByText(/In Progress/iu)).toBeVisible()
  })

  test('clicking an experiment row opens the experiment sheet', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.getByRole('tab', { name: /Experiments/iu }).click()
    await page.getByRole('row', { name: /homepage_hero_reorder/u }).click()

    await expect(page.getByRole('dialog').getByText('homepage_hero_reorder').first()).toBeVisible()
  })

  test('clicking a dynamic config row opens the config sheet', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.getByRole('tab', { name: /Configs/iu }).click()
    await page.getByRole('row', { name: /homepage_banner_config/u }).click()

    await expect(page.getByRole('dialog').getByText('homepage_banner_config').first()).toBeVisible()
  })

  test('clicking an audit log row opens the audit log detail sheet', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.getByRole('tab', { name: /Audit Logs/iu }).click()
    // AuditLogRow is a `role="button"` element, not a table row.
    await page.getByRole('button', { name: /new_checkout_flow/u }).click()

    // Sheet header repeats the name and exposes Statsig deep link button.
    await expect(page.getByRole('dialog').getByRole('link', { name: /Statsig/iu })).toBeVisible()
  })

  test('Escape closes an open detail sheet', async ({ context, extensionId }) => {
    // The detail Sheet is modal, so users cannot switch tabs without closing it first.
    // This covers the onOpenChange → setItemSheetOpen(false) branch reachable from the keyboard.
    const page = await context.newPage()
    await openAuthenticated(page, extensionId)

    await page.getByRole('tab', { name: /Gates/iu }).click()
    await page.getByRole('row', { name: /new_checkout_flow/u }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
