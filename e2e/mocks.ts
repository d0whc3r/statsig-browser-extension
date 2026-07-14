import type { Page, Worker } from '@playwright/test'

export interface MockRoute {
  /** Regex (as string) matched against the request URL (the path passed to wretch). */
  urlPattern: string
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
const HTTP_OK_MIN = 200
const HTTP_OK_MAX = 300
const RECORD_GLOBAL = '__e2eMockApiCalls'

/**
 * Resets the extension's local storage and seeds the API key.
 * Forces the popup to skip the login modal on next load.
 */
export const seedApiKey = async (serviceWorker: Worker, apiKey = 'console-mock-key'): Promise<void> => {
  await serviceWorker.evaluate(
    async ([storageKey, key]) =>
      new Promise<void>((resolve) => {
        chrome.storage.local.clear(() => {
          chrome.storage.local.set({ [storageKey as string]: key }, () => {
            resolve()
          })
        })
      }),
    [STORAGE_KEY, apiKey] as const,
  )
}

/**
 * Installs an API mock by overriding `runtime.sendMessage` in the popup page
 * before any app code runs. Calls of shape `{type:'API_REQUEST', config:{url,...}}`
 * are matched against the supplied routes; everything else falls through to the
 * real runtime.
 *
 * Patches BOTH `chrome.runtime.sendMessage` and `browser.runtime.sendMessage`
 * because wxt's webextension-polyfill may hold a cached reference.
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
    }: {
      serializedRoutes: MockRoute[]
      httpOkMin: number
      httpOkMax: number
      recordGlobal: string
    }) => {
      interface ApiMessage {
        type?: string
        config?: { url?: string; method?: string; body?: string; headers?: Record<string, string> }
      }

      const root = globalThis as unknown as Record<string, unknown>
      root[recordGlobal] = []

      const compiledRoutes = serializedRoutes.map((route) => ({
        ...route,
        regex: new RegExp(route.urlPattern, 'u'),
      }))

      const buildHandler =
        (originalSendMessage: ((...args: unknown[]) => Promise<unknown>) | undefined) =>
        (...args: unknown[]): Promise<unknown> => {
          const message = args.at(-1) as ApiMessage | undefined
          const isApiRequest =
            Boolean(message) &&
            typeof message === 'object' &&
            message?.type === 'API_REQUEST' &&
            Boolean(message.config)

          if (!isApiRequest || !message?.config) {
            return originalSendMessage ? originalSendMessage(...args) : Promise.resolve(null)
          }

          const { url = '', method = 'GET', body } = message.config
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
            return route.regex.test(url)
          })

          ;(root[recordGlobal] as unknown[]).push({
            body: parsedBody,
            matched: Boolean(match),
            method,
            url,
          })

          if (!match) {
            return Promise.resolve({
              error: `No mock for ${method} ${url}`,
              success: false,
            })
          }

          const status = match.status ?? httpOkMin
          const ok = status >= httpOkMin && status < httpOkMax
          return Promise.resolve({
            response: {
              data: match.data,
              headers: { 'content-type': 'application/json' },
              ok,
              status,
              statusText: ok ? 'OK' : 'Error',
              url,
            },
            success: true,
          })
        }

      const patchRuntime = (namespace: { runtime?: { sendMessage: unknown } } | undefined): void => {
        if (!namespace?.runtime) {
          return
        }
        const original = namespace.runtime.sendMessage as ((...args: unknown[]) => Promise<unknown>) | undefined
        const bound = original?.bind(namespace.runtime)
        namespace.runtime.sendMessage = buildHandler(bound)
      }

      patchRuntime((root as { chrome?: { runtime?: { sendMessage: unknown } } }).chrome)
      patchRuntime((root as { browser?: { runtime?: { sendMessage: unknown } } }).browser)
    },
    { httpOkMax: HTTP_OK_MAX, httpOkMin: HTTP_OK_MIN, recordGlobal: RECORD_GLOBAL, serializedRoutes: routes },
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
