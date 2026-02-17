import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'

import { apiKeyStorage } from '@/src/lib/storage'

export default defineBackground(() => {
  // Listen for API requests from the popup/options pages
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'API_REQUEST' && message.config) {
      const { url, method, body, headers } = message.config

      // Perform the fetch request
      apiKeyStorage.getValue().then((apiKey: string | null) => {
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
