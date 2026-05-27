import { expect, test } from './fixtures'
import { mockFeatureGates, paginated } from './mock-data'
import { mockApi } from './mocks'

test.describe('login flow', () => {
  test('logs in successfully when api key is valid', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await mockApi(page, [
      { data: paginated(mockFeatureGates.slice(0, 1)), urlPattern: String.raw`/gates(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/experiments(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/dynamic_configs(\?|$)` },
      { data: paginated([]), urlPattern: String.raw`/audit_logs(\?|$)` },
    ])
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await expect(page.getByText('Login to Statsig')).toBeVisible()

    await page.getByLabel(/Statsig Console API Key/iu).fill('console-valid-test-key')
    await page.getByRole('button', { name: /Login/iu }).click()

    await expect(page.getByText('Login to Statsig')).toBeHidden()
  })

  test('keeps modal open and preserves input on 401', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const mock = await mockApi(page, [
      {
        data: { message: 'Invalid API key.' },
        status: 401,
        urlPattern: String.raw`/gates(\?|$)`,
      },
    ])
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    const input = page.getByLabel(/Statsig Console API Key/iu)
    await input.fill('console-bad-key')
    await page.getByRole('button', { name: /Login/iu }).click()

    await expect(page.getByText('Login to Statsig')).toBeVisible()
    await expect(input).toHaveValue('console-bad-key')

    const gateCalls = await mock.callsFor(/\/gates/u)
    expect(gateCalls.length).toBeGreaterThan(0)
  })
})
