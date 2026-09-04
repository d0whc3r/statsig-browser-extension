import type { BrowserContext, Page } from '@playwright/test'

import type { MockRoute } from './mocks'

import { seedExtensionLocalRecord } from './extension-runtime'
import { expect, test } from './fixtures'
import { defaultRoutes, makeFeatureGate, paginated } from './mock-data'
import { mockApi } from './mocks'

const PAGE_URL = 'https://statsig-fake.test/'
const PAGE_SDK_KEY = 'client-e2e-page-key'

/** A page running the Statsig JS SDK the way `@statsig/js-client` exposes it. */
const statsigPage = `<!doctype html>
<html>
  <head>
    <title>Fake Statsig app</title>
    <script>
      const values = {
        feature_gates: { '111': {}, '222': {}, '333': {} },
        hash_used: 'djb2',
        hashed_sdk_key_used: '778163576',
      }
      const instance = {
        getCurrentUser: () => ({ userID: 'u_e2e' }),
        getStableID: () => 'stable_e2e',
        getContext: () => ({ sdkKey: '${PAGE_SDK_KEY}', stableID: 'stable_e2e', values }),
      }
      window.__STATSIG__ = { instances: { '${PAGE_SDK_KEY}': instance }, firstInstance: instance }
    </script>
  </head>
  <body>
    <h1>Fake Statsig app</h1>
  </body>
</html>`

const openStatsigPage = async (context: BrowserContext): Promise<Page> => {
  const page = await context.newPage()
  await page.route(`${PAGE_URL}**`, async (route) => {
    await route.fulfill({ body: statsigPage, contentType: 'text/html' })
  })
  await page.goto(PAGE_URL)
  await expect(page.getByRole('heading', { name: 'Fake Statsig app' })).toBeVisible()
  return page
}

/** Opens the popup while the fake Statsig page is the active tab, which is what the popup inspects. */
const openPopupForPage = async (
  context: BrowserContext,
  extensionId: string,
  { routes = defaultRoutes(), statsig }: { routes?: MockRoute[]; statsig: Page },
): Promise<Page> => {
  const popup = await context.newPage()
  await mockApi(popup, routes)
  await popup.goto(`chrome-extension://${extensionId}/popup.html`)
  await statsig.bringToFront()
  await popup.reload()
  return popup
}

test.describe('page to project detection', () => {
  test('reports the page as belonging to the project owning its SDK key', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-mock-key',
      'statsig-projects': [
        {
          apiKey: 'console-mock-key',
          clientKeys: [PAGE_SDK_KEY],
          gateHashes: [],
          id: 'p1',
          label: 'Page Project',
          origins: [],
        },
      ],
    })

    const statsig = await openStatsigPage(context)
    const popup = await openPopupForPage(context, extensionId, { statsig })

    await expect(popup.getByRole('button', { name: /Page Project · this page/iu })).toBeVisible()
  })

  test('replaces every cached project response after detecting a different project', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-first-project',
      'statsig-projects': [
        {
          apiKey: 'console-first-project',
          clientKeys: ['client-first-project'],
          gateHashes: [],
          id: 'p1',
          label: 'First Project',
          origins: [],
        },
        {
          apiKey: 'console-page-project',
          clientKeys: [PAGE_SDK_KEY],
          gateHashes: [],
          id: 'p2',
          label: 'Page Project',
          origins: [],
        },
      ],
    })

    const statsig = await openStatsigPage(context)
    const popup = await openPopupForPage(context, extensionId, {
      routes: [
        {
          apiKey: 'console-first-project',
          data: paginated([makeFeatureGate({ id: 'old-gate', name: 'first_project_gate' })]),
          urlPattern: String.raw`/gates(\?|$)`,
        },
        {
          apiKey: 'console-page-project',
          data: paginated([makeFeatureGate({ id: 'new-gate', name: 'page_project_gate' })]),
          urlPattern: String.raw`/gates(\?|$)`,
        },
        ...defaultRoutes(),
      ],
      statsig,
    })

    await expect(popup.getByRole('button', { name: /Page Project · this page/iu })).toBeVisible()
    await expect(popup.getByRole('row', { name: /page_project_gate/u })).toBeVisible()
    await expect(popup.getByRole('row', { name: /first_project_gate/u })).toHaveCount(0)
  })

  test('reports a page whose SDK key belongs to no configured project', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-mock-key',
      'statsig-projects': [
        {
          apiKey: 'console-mock-key',
          clientKeys: ['client-some-other-project'],
          gateHashes: [],
          id: 'p1',
          label: 'Other Project',
          origins: [],
        },
      ],
    })

    const statsig = await openStatsigPage(context)
    const popup = await openPopupForPage(context, extensionId, { statsig })

    await expect(popup.getByRole('button', { name: /Other Statsig project/iu })).toBeVisible()
    // Nothing may load: the page is not owned by the configured project
    await expect(popup.getByText(/belongs to another Statsig project/iu)).toBeVisible()
    await expect(popup.getByRole('tab', { name: /Gates/iu })).toBeHidden()
    await expect(popup.getByLabel('Statsig Console API Key')).toBeVisible()
  })

  test('matches through the gate fingerprint when the client keys are unknown', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-mock-key',
      'statsig-projects': [
        {
          apiKey: 'console-mock-key',
          // Only the gate fingerprint is known, as when the Console key cannot list keys
          clientKeys: [],
          gateHashes: ['111', '222', '333', '444'],
          id: 'p1',
          label: 'Fingerprinted Project',
          origins: [],
        },
      ],
    })

    const statsig = await openStatsigPage(context)
    const popup = await openPopupForPage(context, extensionId, { statsig })

    await expect(popup.getByRole('button', { name: /Fingerprinted Project · this page/iu })).toBeVisible()
  })

  test('says when the inspected page runs no Statsig SDK', async ({ context, extensionId, serviceWorker }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-mock-key',
      'statsig-projects': [
        {
          apiKey: 'console-mock-key',
          clientKeys: ['client-some-other-project'],
          gateHashes: [],
          id: 'p1',
          label: 'Other Project',
          origins: [],
        },
      ],
    })

    const blank = await context.newPage()
    await blank.route('https://blank-page.test/**', async (route) => {
      await route.fulfill({
        body: '<!doctype html><html><body><h1>Nothing here</h1></body></html>',
        contentType: 'text/html',
      })
    })
    await blank.goto('https://blank-page.test/')

    const popup = await openPopupForPage(context, extensionId, { statsig: blank })

    await expect(popup.getByRole('button', { name: /No Statsig on this page/iu })).toBeVisible()
    await expect(popup.getByRole('tab', { name: /Gates/iu })).toBeHidden()
  })

  test('loads the project data once the key of the inspected site is added', async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await serviceWorker.evaluate(seedExtensionLocalRecord, {
      'statsig-active-project-id': 'p1',
      'statsig-console-api-key': 'console-mock-key',
      'statsig-projects': [
        {
          apiKey: 'console-mock-key',
          clientKeys: ['client-some-other-project'],
          gateHashes: [],
          id: 'p1',
          label: 'Other Project',
          origins: [],
        },
      ],
    })

    const statsig = await openStatsigPage(context)
    const popup = await openPopupForPage(context, extensionId, { statsig })

    await expect(popup.getByRole('tab', { name: /Gates/iu })).toBeHidden()

    await popup.getByLabel('Statsig Console API Key').fill('console-page-project-key')
    await popup.getByRole('button', { name: /^Add$/iu }).click()

    await expect(popup.getByRole('tab', { name: /Gates/iu })).toBeVisible()
    await expect(popup.getByRole('row', { name: /new_checkout_flow/u })).toBeVisible()
  })
})
