import { useQuery } from '@tanstack/react-query'

import { fetchAllPages } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGate } from '../types/statsig'

/**
 * Fetches all feature gates from the Statsig API by iterating through pages.
 *
 * @returns A promise resolving to an array of all feature gates
 * @throws Error if the fetch fails
 */
const fetchAllFeatureGates = async (): Promise<FeatureGate[]> => {
  try {
    return await fetchAllPages<FeatureGate>('/gates')
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
