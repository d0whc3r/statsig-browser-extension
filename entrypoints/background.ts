import { defineBackground } from 'wxt/utils/define-background'

import { apiKeyStorage } from '@/src/lib/storage'

export default defineBackground(() => {
  // Listen for API requests from the popup/options pages
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'AXIOS_REQUEST' && message.config) {
      const { url, method, data, headers, baseURL } = message.config

      const fullUrl = baseURL ? `${baseURL}${url}` : url

      // Perform the fetch request
      apiKeyStorage.getValue().then((apiKey: string | null) => {
        const finalHeaders = { ...headers }
        if (apiKey && !finalHeaders['STATSIG-API-KEY']) {
          // Remove quotes if present (legacy support)
          finalHeaders['STATSIG-API-KEY'] = apiKey.replaceAll('"', '')
        }

        fetch(fullUrl, {
          body: data ? JSON.stringify(data) : undefined,
          headers: finalHeaders,
          method,
        })
          .then(async (response) => {
            const responseData = await response.json().catch(() => null) // Handle non-JSON responses
            const responseHeaders: Record<string, string> = {}
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value
            })

            sendResponse({
              response: {
                data: responseData,
                headers: responseHeaders,
                status: response.status,
                statusText: response.statusText,
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
