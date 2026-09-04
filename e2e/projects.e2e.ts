import type { Locator, Page } from '@playwright/test'

import { readExtensionLocalValue } from './extension-runtime'
import { expect, test } from './fixtures'
import { defaultRoutes } from './mock-data'
import { mockApi, seedLegacyApiKey } from './mocks'

const PROJECTS_KEY = 'statsig-projects'
const ACTIVE_PROJECT_KEY = 'statsig-active-project-id'
const API_KEY_KEY = 'statsig-console-api-key'

interface StoredProject {
  id: string
  label: string
  apiKey: string
  clientKeys: string[]
}

const keysRoute = () => ({
  data: {
    data: [
      { key: 'client-second-a', type: 'CLIENT' },
      { key: 'client-second-b', type: 'CLIENT' },
      { key: 'secret-second', type: 'SERVER' },
    ],
  },
  urlPattern: String.raw`/keys(\?|$)`,
})

/**
 * Opens the settings sheet and returns it. These tests seed the pre-projects key, so the popup is
 * showing the page gate — which offers the same "add project" form — hence every project assertion
 * is scoped to the sheet.
 */
const openSettings = async (page: Page, extensionId: string): Promise<Locator> => {
  await mockApi(page, [...defaultRoutes(), keysRoute()])
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.getByText('Login to Statsig')).toBeHidden()
  await page.locator('header button').last().click()
  await page.getByRole('menuitem', { name: /^Settings$/iu }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByRole('heading', { name: /Extension Settings/iu })).toBeVisible()
  return sheet
}

test.describe('statsig projects', () => {
  test.beforeEach(async ({ serviceWorker }) => {
    await seedLegacyApiKey(serviceWorker)
  })

  test('migrates the previously stored key into the first project', async ({ context, extensionId, serviceWorker }) => {
    const page = await context.newPage()
    const sheet = await openSettings(page, extensionId)

    await expect(sheet.getByLabel('Project name')).toHaveValue('Project 1')
    await expect(sheet.getByRole('button', { name: 'Project 1 is active' })).toBeVisible()

    const stored = (await serviceWorker.evaluate(readExtensionLocalValue, PROJECTS_KEY)) as StoredProject[]
    expect(stored).toHaveLength(1)
    expect(stored[0].apiKey).toBe('console-mock-key')
  })

  test('adds a second project, activates it and keeps its client keys', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage()
    const sheet = await openSettings(page, extensionId)

    await sheet.getByLabel('Statsig Console API Key').fill('console-second-key')
    await sheet.getByRole('button', { name: /^Add$/iu }).click()

    await expect(sheet.getByRole('button', { name: 'Project 2 is active' })).toBeVisible()
    // Both projects resolve their keys from the same mock, so read the badge of the active row
    await expect(sheet.locator('[data-active="true"]').getByText('2 client keys')).toBeVisible()

    const stored = (await serviceWorker.evaluate(readExtensionLocalValue, PROJECTS_KEY)) as StoredProject[]
    expect(stored).toHaveLength(2)
    expect(stored[1].clientKeys).toStrictEqual(['client-second-a', 'client-second-b'])

    const activeId = await serviceWorker.evaluate(readExtensionLocalValue, ACTIVE_PROJECT_KEY)
    expect(activeId).toBe(stored[1].id)

    // The background script authorizes requests with the active project's key
    const mirroredKey = await serviceWorker.evaluate(readExtensionLocalValue, API_KEY_KEY)
    expect(mirroredKey).toBe('console-second-key')
  })

  test('switching back to another project survives reopening the popup', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage()
    const sheet = await openSettings(page, extensionId)

    await sheet.getByLabel('Statsig Console API Key').fill('console-second-key')
    await sheet.getByRole('button', { name: /^Add$/iu }).click()
    await expect(sheet.getByRole('button', { name: 'Project 2 is active' })).toBeVisible()

    await sheet.getByRole('button', { name: 'Use Project 1' }).click()
    await expect(sheet.getByRole('button', { name: 'Project 1 is active' })).toBeVisible()

    const reopened = await context.newPage()
    const reopenedSheet = await openSettings(reopened, extensionId)
    await expect(reopenedSheet.getByRole('button', { name: 'Project 1 is active' })).toBeVisible()

    const mirroredKey = await serviceWorker.evaluate(readExtensionLocalValue, API_KEY_KEY)
    expect(mirroredKey).toBe('console-mock-key')
  })

  test('removes a project', async ({ context, extensionId, serviceWorker }) => {
    const page = await context.newPage()
    const sheet = await openSettings(page, extensionId)

    await sheet.getByLabel('Statsig Console API Key').fill('console-second-key')
    await sheet.getByRole('button', { name: /^Add$/iu }).click()
    await expect(sheet.getByRole('button', { name: 'Project 2 is active' })).toBeVisible()

    await sheet.getByRole('button', { name: 'Remove Project 2' }).click()
    await expect(sheet.getByRole('button', { name: 'Project 1 is active' })).toBeVisible()

    const stored = (await serviceWorker.evaluate(readExtensionLocalValue, PROJECTS_KEY)) as StoredProject[]
    expect(stored).toHaveLength(1)
    expect(stored[0].label).toBe('Project 1')
  })
})
