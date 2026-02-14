import { useQuery } from '@tanstack/react-query'

import { fetchAllPages } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { DynamicConfig } from '../types/statsig'

/**
 * Fetches all dynamic configs from the Statsig API by iterating through pages.
 *
 * @returns A promise resolving to an array of all dynamic configs
 * @throws Error if the fetch fails
 */
const fetchAllDynamicConfigs = async (): Promise<DynamicConfig[]> => {
  try {
    return await fetchAllPages<DynamicConfig>('/dynamic_configs')
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
