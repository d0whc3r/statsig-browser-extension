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

interface PaginationInfo {
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

export const fetchAllPages = async <ItemType>(
  endpoint: string,
  limit = 100,
): Promise<ItemType[]> => {
  const allItems: ItemType[] = []
  let page = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetcher<{ data: ItemType[] } & PaginationInfo>(
      `${endpoint}?limit=${limit}&page=${page}`,
    )

    allItems.push(...response.data)

    const { page: currentPage, limit: currentLimit, totalItems } = response.pagination
    if (currentPage * currentLimit >= totalItems) {
      break
    }
    page++
  }
  return allItems
}
