import wretch from 'wretch'
import { browser } from 'wxt/browser'

export const API_BASE_URL = 'https://statsigapi.net/console/v1'

const customFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await browser.runtime.sendMessage({
    config: {
      body: init?.body,
      headers: init?.headers,
      method: init?.method,
      url: url.toString(),
    },
    type: 'API_REQUEST',
  })

  if (!response.success) {
    throw new TypeError(response.error)
  }

  const { data, headers, status, statusText } = response.response

  // Convert data back to string for Response body if it's an object
  const body = typeof data === 'object' ? JSON.stringify(data) : data

  const responseObj = new Response(body, {
    headers: new Headers(headers),
    status,
    statusText,
  })

  // Attach the parsed data to the response object for synchronous access in error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(responseObj as any)._data = data

  return responseObj
}

export const api = wretch(API_BASE_URL).fetchPolyfill(customFetch)

export const fetcher = <ResponseData>(url: string): Promise<ResponseData> =>
  api.url(url).get().json<ResponseData>()

export const poster = <ResponseData>(url: string, body: unknown): Promise<ResponseData> =>
  api.url(url).post(body).json<ResponseData>()
