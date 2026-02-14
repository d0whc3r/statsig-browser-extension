import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { DynamicConfigRule } from '../types/statsig'

interface DynamicConfigRulesResponse {
  data: {
    rules: DynamicConfigRule[]
  }[]
  message: string
}

const fetchDynamicConfigRules = async (configId: string): Promise<DynamicConfigRule[]> => {
  try {
    const result = await fetcher<DynamicConfigRulesResponse>(`/dynamic_configs/${configId}/rules`)
    return result.data?.[0]?.rules || []
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useDynamicConfigRules = (configId: string) =>
  useQuery({
    enabled: Boolean(configId),
    queryFn: () => fetchDynamicConfigRules(configId),
    queryKey: ['dynamic-config-rules', configId],
  })
