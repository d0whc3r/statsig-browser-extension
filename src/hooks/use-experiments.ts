import { useInfiniteQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { Experiment } from '../types/statsig'

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
 * Fetches a single page of experiments from the Statsig API.
 *
 * @param page - The page number to fetch
 * @returns A promise resolving to the paginated experiments response
 * @throws Error if the fetch fails
 */
const fetchExperimentsPage = async (page: number): Promise<PaginatedResponse<Experiment>> => {
  try {
    return await fetcher<PaginatedResponse<Experiment>>(
      `/experiments?limit=${PAGE_LIMIT}&page=${page}`,
    )
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch experiments using infinite scrolling.
 * Uses the stored API key.
 *
 * @returns The Infinite React Query result containing the experiments pages
 */
export const useExperiments = () =>
  useInfiniteQuery({
    getNextPageParam: (lastPage: PaginatedResponse<Experiment>) => {
      if (!lastPage?.pagination) {
        return undefined
      }
      const currentTotal = lastPage.pagination.page * lastPage.pagination.limit
      if (currentTotal < lastPage.pagination.totalItems) {
        return lastPage.pagination.page + 1
      }
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchExperimentsPage(pageParam),
    queryKey: ['experiments'],
  })
