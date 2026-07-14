import type { Page } from '@playwright/test'

import type { MockRoute } from './mocks'

import { expect, test } from './fixtures'
import { mockAuditLogs, mockDynamicConfigs, mockExperiments, mockFeatureGates, paginated } from './mock-data'
import { mockApi, seedApiKey } from './mocks'

const errorThenSuccessRoutes = (): MockRoute[] => [
  // 500 on first match short-circuits the wretch chain, surfacing an error in the table body.
  { data: { message: 'Internal Server Error' }, status: 500, urlPattern: String.raw`/gates(\?|$)` },
  { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
  { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
  { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
]

const openAuthenticated = async (page: Page, extensionId: string, routes: MockRoute[]): Promise<void> => {
  await mockApi(page, routes)
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
}

test.describe('error handling', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedApiKey(serviceWorker)
  })

  test('shows error UI with retry button when /gates returns 500', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId, errorThenSuccessRoutes())

    await page.getByRole('tab', { name: /Gates/iu }).click()

    await expect(page.getByText(/Failed to load feature gates/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Retry/iu })).toBeVisible()
  })

  test('retry button triggers another fetch', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const mock = await mockApi(page, errorThenSuccessRoutes())
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    await page.getByRole('tab', { name: /Gates/iu }).click()
    await expect(page.getByText(/Failed to load feature gates/iu)).toBeVisible()

    const beforeCalls = await mock.callsFor(/\/gates(?:\?|$)/u)
    const beforeCount = beforeCalls.length
    await page.getByRole('button', { name: /Retry/iu }).click()

    // Allow the refetch to settle before counting.
    await expect
      .poll(async () => {
        const calls = await mock.callsFor(/\/gates(?:\?|$)/u)
        return calls.length
      })
      .toBeGreaterThan(beforeCount)
  })

  test('dynamic configs tab surfaces its own error UI on 500', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await openAuthenticated(page, extensionId, [
      { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
      { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
      { data: { message: 'Internal Server Error' }, status: 500, urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])

    await page.getByRole('tab', { name: /Configs/iu }).click()

    await expect(page.getByText(/Failed to load dynamic configs/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Retry/iu })).toBeVisible()
  })

  test('experiments tab has no error UI on 500 (source-code gap)', async ({ context, extensionId }) => {
    // ExperimentsTableBody intentionally has no isError branch (unlike FeatureGatesTableBody
    // And DynamicConfigsTableBody). This test pins the current behavior — if an error branch
    // Is added to ExperimentsTableBody, flip this assertion to match.
    const page = await context.newPage()
    await openAuthenticated(page, extensionId, [
      { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
      { data: { message: 'Internal Server Error' }, status: 500, urlPattern: String.raw`/experiments(\?|$)` },
      { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])

    await page.getByRole('tab', { name: /Experiments/iu }).click()

    await expect(page.getByText(/Failed to load experiments/iu)).toHaveCount(0)
  })

  test('unmatched API request returns "No mock" without throwing UI', async ({ context, extensionId }) => {
    // Sanity check: covers the unmatched branch in mocks.ts to ensure tests fail loudly
    // When a missing mock is hit, rather than silently passing.
    const page = await context.newPage()
    const mock = await mockApi(page, [
      { data: paginated([]), urlPattern: String.raw`/gates(\?|$)` },
      // Intentionally omit /experiments to leave it unmatched.
      { data: paginated([]), urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])
    await page.goto(`chrome-extension://${extensionId}/popup.html`)
    await expect(page.getByText('Login to Statsig')).toBeHidden()

    await page.getByRole('tab', { name: /Experiments/iu }).click()

    const experimentCalls = await mock.callsFor(/\/experiments(?:\?|$)/u)
    expect(experimentCalls.length).toBeGreaterThan(0)
    expect(experimentCalls.every((call) => !call.matched)).toBe(true)
  })
})
