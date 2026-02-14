import { useQuery } from '@tanstack/react-query'

import { fetchAllPages } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { Experiment } from '../types/statsig'

/**
 * Fetches all experiments from the Statsig API by iterating through pages.
 *
 * @returns A promise resolving to an array of all experiments
 * @throws Error if the fetch fails
 */
const fetchAllExperiments = async (): Promise<Experiment[]> => {
  try {
    return await fetchAllPages<Experiment>('/experiments')
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch all experiments.
 * Uses the stored API key.
 *
 * @returns The React Query result containing the list of experiments
 */
export const useExperiments = () =>
  useQuery({
    queryFn: fetchAllExperiments,
    queryKey: ['experiments'],
  })
