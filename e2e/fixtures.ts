import type { BrowserContext, Worker } from '@playwright/test'

import { test as base, chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'

const EXTENSION_PATH = path.resolve(import.meta.dirname, '..', '.output', 'chrome-mv3')

const isExtensionWorker = (worker: Worker): boolean => worker.url().startsWith('chrome-extension://')

interface ExtensionFixtures {
  context: BrowserContext
  extensionId: string
  serviceWorker: Worker
}

export const test = base.extend<ExtensionFixtures>({
  // oxlint-disable-next-line no-empty-pattern
  context: async ({}, contextUse) => {
    if (!existsSync(EXTENSION_PATH)) {
      throw new Error(
        `Extension build not found at ${EXTENSION_PATH}. Run \`pnpm build:chrome\` before running e2e tests.`,
      )
    }

    const context = await chromium.launchPersistentContext('', {
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-first-run',
        '--no-default-browser-check',
      ],
      channel: 'chromium',
    })

    await contextUse(context)
    await context.close()
  },

  extensionId: async ({ serviceWorker }, contextUse) => {
    const { host } = new URL(serviceWorker.url())
    await contextUse(host)
  },

  serviceWorker: async ({ context }, contextUse) => {
    // Filter for the extension's own service worker — defensive in case
    // Playwright returns unrelated SW entries when parallelism is re-enabled.
    const existing = context.serviceWorkers().find((worker) => isExtensionWorker(worker))
    const worker = existing ?? (await context.waitForEvent('serviceworker', { predicate: isExtensionWorker }))
    await contextUse(worker)
  },
})

export const { expect } = test
