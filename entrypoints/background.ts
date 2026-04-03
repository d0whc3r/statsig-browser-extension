import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'

import { apiKeyStorage } from '@/src/lib/storage'

interface ApiRequestMessage {
  type: string
  config?: {
    url: string
    method?: string
    body?: string
    headers?: Record<string, string>
  }
}

const isApiRequestMessage = (msg: unknown): msg is ApiRequestMessage =>
  typeof msg === 'object' && msg !== null && 'type' in msg

export default defineBackground(() => {
  // Listen for API requests from the popup/options pages
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (isApiRequestMessage(message) && message.type === 'API_REQUEST' && message.config) {
      const { url, method, body, headers } = message.config

      // Perform the fetch request
      void apiKeyStorage.getValue().then((apiKey: string | null) => {
        const finalHeaders = { ...headers }
        if (apiKey && !finalHeaders['STATSIG-API-KEY']) {
          // Remove quotes if present (legacy support)
          finalHeaders['STATSIG-API-KEY'] = apiKey.replaceAll('"', '')
        }

        fetch(url, {
          body,
          headers: finalHeaders,
          method,
        })
          .then(async (response) => {
            const responseData = await response.text().then((text) => {
              try {
                return JSON.parse(text)
              } catch {
                return text
              }
            })

            const responseHeaders: Record<string, string> = {}
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value
            })

            sendResponse({
              response: {
                data: responseData,
                headers: responseHeaders,
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                url: response.url,
              },
              success: true,
            })
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Network error'
            sendResponse({
              error: errorMessage,
              success: false,
            })
          })
      })

      return true // Indicates we will respond asynchronously
    }
  })
})
