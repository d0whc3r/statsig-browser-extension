import type { AxiosAdapter } from 'axios'

import axios, { AxiosHeaders } from 'axios'
import { browser } from 'wxt/browser'

export const API_BASE_URL = 'https://statsigapi.net/console/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

const backgroundAdapter: AxiosAdapter = async (config) => {
  // Use the api instance to resolve the full URL including params
  const url = api.getUri(config)

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers.toJSON()
      : (config.headers as Record<string, string>)

  // Send request to background
  const response = await browser.runtime.sendMessage({
    config: {
      data: config.data,
      headers,
      method: config.method,
      url,
    },
    type: 'AXIOS_REQUEST',
  })

  if (!response.success) {
    throw new Error(response.error)
  }

  return {
    config,
    data: response.response.data,
    headers: response.response.headers,
    request: {}, // Dummy request object
    status: response.response.status,
    statusText: response.response.statusText,
  }
}

api.defaults.adapter = backgroundAdapter

export const fetcher = async <ResponseData>(url: string): Promise<ResponseData> => {
  const response = await api.get<ResponseData>(url)
  return response.data
}

export const poster = async <ResponseData>(url: string, body: unknown): Promise<ResponseData> => {
  const response = await api.post<ResponseData>(url, body)
  return response.data
}
