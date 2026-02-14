import { useInfiniteQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { DynamicConfig } from '../types/statsig'

const PAGE_LIMIT = 100

export interface PaginatedResponse<ItemType> {
  data: ItemType[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

/**
 * Fetches a single page of dynamic configs from the Statsig API.
 *
 * @param page - The page number to fetch
 * @returns A promise resolving to the paginated dynamic configs response
 * @throws Error if the fetch fails
 */
const fetchDynamicConfigsPage = async (page: number): Promise<PaginatedResponse<DynamicConfig>> => {
  try {
    return await fetcher<PaginatedResponse<DynamicConfig>>(
      `/dynamic_configs?limit=${PAGE_LIMIT}&page=${page}`,
    )
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch dynamic configs using infinite scrolling.
 * Uses the stored API key.
 *
 * @returns The Infinite React Query result containing the dynamic configs pages
 */
export const useDynamicConfigs = () =>
  useInfiniteQuery({
    getNextPageParam: (lastPage: PaginatedResponse<DynamicConfig>) => {
      const currentTotal = lastPage.pagination.page * lastPage.pagination.limit
      if (currentTotal < lastPage.pagination.totalItems) {
        return lastPage.pagination.page + 1
      }
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchDynamicConfigsPage(pageParam),
    queryKey: ['dynamic-configs'],
  })
