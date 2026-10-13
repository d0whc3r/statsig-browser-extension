import { useInfiniteQuery } from '@tanstack/react-query'

import type { PaginatedResponse } from '@/src/lib/pagination'

import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { fetcher } from '@/src/lib/fetcher'
import { getNextPageParam } from '@/src/lib/pagination'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGate } from '../types/statsig'

const PAGE_LIMIT = 100

/**
 * Fetches a single page of feature gates from the Statsig API.
 *
 * @param page - The page number to fetch
 * @returns A promise resolving to the paginated feature gates response
 * @throws Error if the fetch fails
 */
const fetchFeatureGatesPage = async (page: number): Promise<PaginatedResponse<FeatureGate>> => {
  try {
    return await fetcher<PaginatedResponse<FeatureGate>>(`/gates?limit=${PAGE_LIMIT}&page=${page}`)
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch feature gates using infinite scrolling.
 * Uses the stored API key.
 *
 * @returns The Infinite React Query result containing the feature gates pages
 */
export const useFeatureGates = (enabled = true) => {
  const { apiKey } = useSettingsStorage()

  return useInfiniteQuery({
    enabled: enabled && Boolean(apiKey),
    getNextPageParam,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchFeatureGatesPage(pageParam),
    queryKey: ['feature-gates'],
  })
}
