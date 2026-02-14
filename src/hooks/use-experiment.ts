import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { Experiment } from '../types/statsig'

interface ApiResponse<DataType> {
  data: DataType
}

const fetchExperiment = async (experimentId: string): Promise<Experiment> => {
  try {
    const result = await fetcher<ApiResponse<Experiment>>(`/experiments/${experimentId}`)
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useExperiment = (experimentId?: string) =>
  useQuery({
    enabled: Boolean(experimentId),
    queryFn: () => fetchExperiment(experimentId!),
    queryKey: ['experiment', experimentId],
  })
