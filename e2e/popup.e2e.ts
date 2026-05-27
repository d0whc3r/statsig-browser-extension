import { expect, test } from './fixtures'

test.describe('popup smoke', () => {
  test('loads extension service worker', async ({ extensionId }) => {
    expect(extensionId).toMatch(/^[a-p]{32}$/u)
  })

  test('opens popup and renders login modal', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await expect(page.getByText('Login to Statsig')).toBeVisible()
    await expect(page.getByLabel(/Statsig Console API Key/iu)).toBeVisible()
    await expect(page.getByRole('button', { name: /Login/iu })).toBeVisible()
  })

  test('shows validation error when submitting empty key', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await page.getByRole('button', { name: /Login/iu }).click()

    await expect(page.getByText('Please enter an API key')).toBeVisible()
  })

  test('shows validation error when key does not start with "console-"', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await page.getByLabel(/Statsig Console API Key/iu).fill('invalid-key')
    await page.getByRole('button', { name: /Login/iu }).click()

    await expect(page.getByText(/API key should start with "console-"/iu)).toBeVisible()
  })

  test('login modal stays open when clicking outside (modal is locked)', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await expect(page.getByText('Login to Statsig')).toBeVisible()

    await page.mouse.click(10, 10)

    await expect(page.getByText('Login to Statsig')).toBeVisible()
  })

  test('login modal stays open when pressing Escape (modal is locked)', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    await expect(page.getByText('Login to Statsig')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByText('Login to Statsig')).toBeVisible()
  })
})
