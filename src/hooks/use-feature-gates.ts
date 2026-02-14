import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGate } from '../types/statsig'

const PAGE_LIMIT = 100

// eslint-disable-next-line id-length
interface PaginatedResponse<ItemType> {
  data: ItemType[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

/**
 * Fetches all feature gates from the Statsig API by iterating through pages.
 *
 * @returns A promise resolving to an array of all feature gates
 * @throws Error if the fetch fails
 */
// eslint-disable-next-line max-statements
const fetchAllFeatureGates = async (): Promise<FeatureGate[]> => {
  const allGates: FeatureGate[] = []
  let page = 1
  let hasMore = true

  try {
    while (hasMore) {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetcher<PaginatedResponse<FeatureGate>>(
        `/gates?limit=${PAGE_LIMIT}&page=${page}`,
      )

      allGates.push(...response.data)

      const currentTotal = response.pagination.page * response.pagination.limit
      if (currentTotal < response.pagination.totalItems) {
        page++
      } else {
        hasMore = false
      }
    }
    return allGates
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch all feature gates.
 * Uses the stored API key.
 *
 * @returns The React Query result containing the list of feature gates
 */
export const useFeatureGates = () =>
  useQuery({
    queryFn: fetchAllFeatureGates,
    queryKey: ['feature-gates'],
  })
