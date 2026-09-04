/**
 * Playwright `evaluate` callbacks are serialized in isolation (no module
 * closures). Each function below is self-contained on purpose.
 *
 * WXT app code uses `import { browser } from 'wxt/browser'`. Chromium's native
 * global is still `chrome`; Firefox's is `browser`. These helpers alias once
 * and then only call `browser`.
 */

type RuntimeRoot = typeof globalThis & {
  browser?: {
    runtime?: { sendMessage: unknown }
    storage?: {
      local?: {
        clear: () => Promise<void>
        get: (key: string) => Promise<Record<string, unknown>>
        set: (items: Record<string, unknown>) => Promise<void>
      }
    }
  }
  chrome?: RuntimeRoot['browser']
}

export const ensureBrowserGlobal = (): void => {
  const root = globalThis as RuntimeRoot
  root.browser ??= root.chrome
}

export const seedExtensionLocalStorage = async ([storageKey, value]: [string, string]): Promise<void> => {
  const root = globalThis as RuntimeRoot
  root.browser ??= root.chrome
  const local = root.browser?.storage?.local
  if (!local) {
    throw new Error('browser.storage.local is not available')
  }
  await local.clear()
  await local.set({ [storageKey]: value })
}

export const seedExtensionLocalRecord = async (items: Record<string, unknown>): Promise<void> => {
  const root = globalThis as RuntimeRoot
  root.browser ??= root.chrome
  const local = root.browser?.storage?.local
  if (!local) {
    throw new Error('browser.storage.local is not available')
  }
  await local.clear()
  await local.set(items)
}

/**
 * Seeds a single project pinned to `origin`. Without the pin the popup refuses to load project
 * data, which is the behaviour on any page that does not belong to a configured project.
 */
export const seedPinnedProject = async ([storageKey, apiKey, origin]: [string, string, string]): Promise<void> => {
  const root = globalThis as RuntimeRoot
  root.browser ??= root.chrome
  const local = root.browser?.storage?.local
  if (!local) {
    throw new Error('browser.storage.local is not available')
  }
  await local.clear()
  await local.set({
    [storageKey]: apiKey,
    'statsig-active-project-id': 'e2e-project',
    'statsig-projects': [
      {
        apiKey,
        clientKeys: [],
        gateHashes: [],
        id: 'e2e-project',
        label: 'Project 1',
        origins: [origin],
      },
    ],
  })
}

export const readExtensionLocalValue = async (key: string): Promise<unknown> => {
  const root = globalThis as RuntimeRoot
  root.browser ??= root.chrome
  const local = root.browser?.storage?.local
  if (!local) {
    throw new Error('browser.storage.local is not available')
  }
  const items = await local.get(key)
  return items[key]
}
