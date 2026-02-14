import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { DynamicConfig } from '../types/statsig'

const PAGE_LIMIT = 100

interface PaginatedResponse<ItemType> {
  data: ItemType[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

/**
 * Fetches all dynamic configs from the Statsig API by iterating through pages.
 *
 * @returns A promise resolving to an array of all dynamic configs
 * @throws Error if the fetch fails
 */
// eslint-disable-next-line max-statements
const fetchAllDynamicConfigs = async (): Promise<DynamicConfig[]> => {
  const allConfigs: DynamicConfig[] = []
  let page = 1
  let hasMore = true

  try {
    while (hasMore) {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetcher<PaginatedResponse<DynamicConfig>>(
        `/dynamic_configs?limit=${PAGE_LIMIT}&page=${page}`,
      )

      allConfigs.push(...response.data)

      const currentTotal = response.pagination.page * response.pagination.limit
      if (currentTotal < response.pagination.totalItems) {
        page++
      } else {
        hasMore = false
      }
    }
    return allConfigs
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch all dynamic configs.
 * Uses the stored API key.
 *
 * @returns The React Query result containing the list of dynamic configs
 */
export const useDynamicConfigs = () =>
  useQuery({
    queryFn: fetchAllDynamicConfigs,
    queryKey: ['dynamic-configs'],
  })
