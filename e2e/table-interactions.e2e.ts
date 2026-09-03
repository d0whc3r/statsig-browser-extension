import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'
import {
  defaultRoutes,
  makeFeatureGate,
  mockAuditLogs,
  mockDynamicConfigs,
  mockExperiments,
  paginated,
} from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const extraGates = Array.from({ length: 8 }, (_unused, index) =>
  makeFeatureGate({
    id: `gate-${index}`,
    isEnabled: index % 2 === 0,
    name: `gate_${String(index).padStart(2, '0')}`,
    status: index % 2 === 0 ? 'In Progress' : 'Disabled',
  }),
)

const openOnGates = async (page: Page, extensionId: string): Promise<void> => {
  await mockApi(page, defaultRoutes())
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
  await page.getByRole('tab', { name: /Gates/iu }).click()
}

test.describe('table interactions', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('sorts feature gates by name when the NAME header is clicked', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGates(page, extensionId)

    const nameHeader = page.getByRole('columnheader', { name: /name/iu })
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none')

    await page.getByRole('button', { name: /^name$/iu }).click()
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

    const rows = page.getByRole('row')
    await expect(rows.nth(1)).toContainText('dark_theme_enabled')
    await expect(rows.nth(2)).toContainText('new_checkout_flow')

    await page.getByRole('button', { name: /^name$/iu }).click()
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    await expect(rows.nth(1)).toContainText('new_checkout_flow')
    await expect(rows.nth(2)).toContainText('dark_theme_enabled')
  })

  test('hides a column from the Columns menu', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGates(page, extensionId)

    await expect(page.getByRole('columnheader', { name: /tags/iu })).toBeVisible()

    await page.getByRole('button', { name: /columns/iu }).click()
    await page.getByRole('menuitemcheckbox', { name: /tags/iu }).click()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('columnheader', { name: /tags/iu })).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /name/iu })).toBeVisible()
  })

  test('paginates when there are more rows than the page size', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await mockApi(page, [
      { data: paginated(extraGates), urlPattern: String.raw`/gates(\?|$)` },
      { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
      { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    await expect(page.getByText('8 feature gates')).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_00/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_05/u })).toHaveCount(0)

    await page.getByRole('button', { exact: true, name: '2' }).click()
    await expect(page.getByRole('row', { name: /gate_05/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_00/u })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('row', { name: /gate_05/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_00/u })).toHaveCount(0)

    await page.getByRole('combobox', { name: /rows per page/iu }).click()
    await page.getByRole('option', { name: '10' }).click()
    await expect(page.getByRole('row', { name: /gate_00/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_07/u })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('combobox', { name: /rows per page/iu })).toHaveText('10')
    await expect(page.getByRole('row', { name: /gate_00/u })).toBeVisible()
    await expect(page.getByRole('row', { name: /gate_07/u })).toBeVisible()
  })

  test('Open Statsig link points at the console', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openOnGates(page, extensionId)

    await expect(page.getByRole('link', { name: /open statsig/iu })).toHaveAttribute(
      'href',
      'https://console.statsig.com/',
    )
  })
})
