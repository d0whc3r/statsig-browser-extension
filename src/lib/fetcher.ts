import wretch from 'wretch'
import { browser } from 'wxt/browser'

export const API_BASE_URL = 'https://statsigapi.net/console/v1'

const getRequestUrl = (url: RequestInfo | URL): string => {
  if (typeof url === 'string') {
    return url
  }
  if (url instanceof URL) {
    return url.href
  }
  if (url instanceof Request) {
    return url.url
  }
  throw new TypeError('Unsupported request URL type')
}

interface ExtMessageResponse {
  success: boolean
  error?: string
  response?: {
    data: unknown
    headers: HeadersInit
    status: number
    statusText: string
  }
}

const isExtMessageResponse = (val: unknown): val is ExtMessageResponse => {
  if (typeof val !== 'object' || val === null) {
    return false
  }
  return 'success' in val
}

const customFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response: unknown = await browser.runtime.sendMessage({
    config: {
      body: init?.body,
      headers: init?.headers,
      method: init?.method,
      url: getRequestUrl(url),
    },
    type: 'API_REQUEST',
  })

  if (!isExtMessageResponse(response)) {
    throw new TypeError('Invalid response from background script')
  }

  if (!response.success || !response.response) {
    throw new TypeError(response.error ?? 'Unknown error')
  }

  const { data, headers, status, statusText } = response.response

  // Convert data back to string for Response body if it's an object
  const body = typeof data === 'string' ? data : JSON.stringify(data)

  const responseObj = new Response(body, {
    headers: new Headers(headers),
    status,
    statusText,
  })

  // Attach the parsed data to the response object for synchronous access in error handling
  Object.defineProperty(responseObj, '_data', {
    configurable: true,
    enumerable: true,
    value: data,
    writable: true,
  })

  return responseObj
}

export const api = wretch(API_BASE_URL).fetchPolyfill(customFetch)

export const fetcher = <ResponseData>(url: string): Promise<ResponseData> => api.url(url).get().json<ResponseData>()

export const poster = <ResponseData>(url: string, body: unknown): Promise<ResponseData> =>
  api.url(url).post(body).json<ResponseData>()
