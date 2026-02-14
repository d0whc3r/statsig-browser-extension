import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGateRule } from '../types/statsig'

interface ExperimentRulesResponse {
  data: {
    rules: FeatureGateRule[]
  }[]
  message: string
}

const fetchExperimentRules = async (experimentId: string): Promise<FeatureGateRule[]> => {
  try {
    const result = await fetcher<ExperimentRulesResponse>(`/experiments/${experimentId}/rules`)
    return result.data?.[0]?.rules || []
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useExperimentRules = (experimentId: string) =>
  useQuery({
    enabled: Boolean(experimentId),
    queryFn: () => fetchExperimentRules(experimentId),
    queryKey: ['experiment-rules', experimentId],
  })
