import type { Page, Worker } from '@playwright/test'

import { seedExtensionLocalStorage, seedPinnedProject } from './extension-runtime'

export interface MockRoute {
  /** Regex (as string) matched against the request URL (the path passed to wretch). */
  urlPattern: string
  /** Active project API key required for this response. Omit to match every project. */
  apiKey?: string
  /** HTTP method to match. Defaults to GET. */
  method?: string
  /** Response body (will be JSON-serialized). */
  data: unknown
  /** HTTP status. Defaults to 200. */
  status?: number
}

export interface RecordedCall {
  method: string
  url: string
  body: unknown
  matched: boolean
}

export interface MockApi {
  /** All API requests intercepted (matched + unmatched). */
  calls: () => Promise<RecordedCall[]>
  /** Returns the recorded calls whose URL matches `pattern`. */
  callsFor: (pattern: RegExp) => Promise<RecordedCall[]>
}

const STORAGE_KEY = 'statsig-console-api-key'
/**
 * Origin reported to the popup as the inspected site. Chrome hides the URL of the
 * `chrome-extension://` tabs the e2e popups run in (`<all_urls>` does not cover them), so the popup
 * would see no site at all and refuse to load a project. `mockApi` fills that URL in and
 * {@link seedApiKey} pins the seeded project to it, which is the state of a real popup opened on a
 * site belonging to the project.
 */
export const ACTIVE_TAB_ORIGIN = 'https://e2e-app.test'
const HTTP_OK_MIN = 200
const HTTP_OK_MAX = 300
const RECORD_GLOBAL = '__e2eMockApiCalls'

/**
 * Resets the extension's local storage and seeds a project holding the API key, pinned to the
 * extension origin so the popup accepts the page it is opened on.
 * Forces the popup to skip the login modal on next load.
 */
export const seedApiKey = async (serviceWorker: Worker, apiKey = 'console-mock-key'): Promise<void> => {
  await serviceWorker.evaluate(seedPinnedProject, [STORAGE_KEY, apiKey, ACTIVE_TAB_ORIGIN] as [string, string, string])
}

/** Seeds only the pre-projects API key, as stored by versions before multi-project support. */
export const seedLegacyApiKey = async (serviceWorker: Worker, apiKey = 'console-mock-key'): Promise<void> => {
  await serviceWorker.evaluate(seedExtensionLocalStorage, [STORAGE_KEY, apiKey] as [string, string])
}

/**
 * Installs an API mock by overriding `runtime.sendMessage` in the popup page
 * before any app code runs. Calls of shape `{type:'API_REQUEST', config:{url,...}}`
 * are matched against the supplied routes; everything else falls through to the
 * real runtime.
 *
 * Patches `browser.runtime.sendMessage` (WXT polyfill). On Chromium the native
 * global is aliased onto `browser` first so Firefox and Chrome share this path.
 *
 * Must be called before `page.goto(...)`.
 *
 * Returns a handle that lets tests assert which API endpoints were called.
 */
export const mockApi = async (page: Page, routes: MockRoute[]): Promise<MockApi> => {
  await page.addInitScript(
    ({
      serializedRoutes,
      httpOkMin,
      httpOkMax,
      recordGlobal,
      activeTabUrl,
      storageKey,
    }: {
      serializedRoutes: MockRoute[]
      httpOkMin: number
      httpOkMax: number
      recordGlobal: string
      activeTabUrl: string
      storageKey: string
    }) => {
      interface ApiMessage {
        type?: string
        config?: { url?: string; method?: string; body?: string; headers?: Record<string, string> }
      }

      const root = globalThis as unknown as Record<string, unknown>
      root[recordGlobal] = []

      interface ExtensionNamespace {
        runtime?: { sendMessage: unknown }
        storage?: { local?: { get: (key: string) => Promise<Record<string, unknown>> } }
        tabs?: { query?: (...args: unknown[]) => Promise<{ url?: string }[]> }
      }
      const runtimeRoot = root as {
        browser?: ExtensionNamespace
        chrome?: ExtensionNamespace
      }
      runtimeRoot.browser ??= runtimeRoot.chrome

      const compiledRoutes = serializedRoutes.map((route) => ({
        ...route,
        regex: new RegExp(route.urlPattern, 'u'),
      }))

      const buildHandler =
        (originalSendMessage: ((...args: unknown[]) => Promise<unknown>) | undefined) =>
        async (...args: unknown[]): Promise<unknown> => {
          const message = args.at(-1) as ApiMessage | undefined
          const isApiRequest =
            Boolean(message) &&
            typeof message === 'object' &&
            message?.type === 'API_REQUEST' &&
            Boolean(message.config)

          if (!isApiRequest || !message?.config) {
            return originalSendMessage ? originalSendMessage(...args) : null
          }

          const { url = '', method = 'GET', body } = message.config
          const stored = await runtimeRoot.browser?.storage?.local?.get(storageKey)
          const currentApiKey = typeof stored?.[storageKey] === 'string' ? stored[storageKey] : undefined
          let parsedBody: unknown = body
          try {
            parsedBody = typeof body === 'string' ? JSON.parse(body) : body
          } catch {
            // Keep raw body when it isn't valid JSON.
          }

          const match = compiledRoutes.find((route) => {
            if ((route.method ?? 'GET').toUpperCase() !== method.toUpperCase()) {
              return false
            }
            return (!route.apiKey || route.apiKey === currentApiKey) && route.regex.test(url)
          })

          ;(root[recordGlobal] as unknown[]).push({
            body: parsedBody,
            matched: Boolean(match),
            method,
            url,
          })

          if (!match) {
            return {
              error: `No mock for ${method} ${url}`,
              success: false,
            }
          }

          const status = match.status ?? httpOkMin
          const ok = status >= httpOkMin && status < httpOkMax
          return {
            response: {
              data: match.data,
              headers: { 'content-type': 'application/json' },
              ok,
              status,
              statusText: ok ? 'OK' : 'Error',
              url,
            },
            success: true,
          }
        }

      const patchRuntime = (namespace: { runtime?: { sendMessage: unknown } } | undefined): void => {
        if (!namespace?.runtime) {
          return
        }
        const original = namespace.runtime.sendMessage as ((...args: unknown[]) => Promise<unknown>) | undefined
        const bound = original?.bind(namespace.runtime)
        namespace.runtime.sendMessage = buildHandler(bound)
      }

      patchRuntime(runtimeRoot.browser)

      const queryTabs = runtimeRoot.browser?.tabs?.query?.bind(runtimeRoot.browser.tabs)

      // Chrome withholds the URL of extension tabs, so report the inspected site the popup expects.
      if (queryTabs && runtimeRoot.browser?.tabs) {
        runtimeRoot.browser.tabs.query = async (...args: unknown[]) => {
          const tabs = await queryTabs(...args)
          for (const tab of tabs) {
            tab.url ??= activeTabUrl
          }
          return tabs
        }
      }
    },
    {
      activeTabUrl: `${ACTIVE_TAB_ORIGIN}/`,
      httpOkMax: HTTP_OK_MAX,
      httpOkMin: HTTP_OK_MIN,
      recordGlobal: RECORD_GLOBAL,
      serializedRoutes: routes,
      storageKey: STORAGE_KEY,
    },
  )

  const calls = async (): Promise<RecordedCall[]> =>
    page.evaluate((key) => (globalThis as unknown as Record<string, RecordedCall[]>)[key] ?? [], RECORD_GLOBAL)

  return {
    calls,
    callsFor: async (pattern: RegExp) => {
      const all = await calls()
      return all.filter((call) => pattern.test(call.url))
    },
  }
}
