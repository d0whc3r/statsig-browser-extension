import axios from 'axios'

export const API_BASE_URL = 'https://statsigapi.net/console/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('statsig-console-api-key')
  // Only set if not already set by the caller
  if (apiKey && !config.headers['STATSIG-API-KEY']) {
    // Remove quotes if present (since localStorage stores JSON stringified values)
    config.headers['STATSIG-API-KEY'] = apiKey.replaceAll('"', '')
  }
  return config
})

export const fetcher = async <ResponseData>(url: string): Promise<ResponseData> => {
  const response = await api.get<ResponseData>(url)
  return response.data
}

export const poster = async <ResponseData>(url: string, body: unknown): Promise<ResponseData> => {
  const response = await api.post<ResponseData>(url, body)
  return response.data
}
