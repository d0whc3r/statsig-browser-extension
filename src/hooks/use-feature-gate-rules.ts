import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGateRule } from '../types/statsig'

interface FeatureGateResponse {
  data: {
    rules: FeatureGateRule[]
  }[]
  message: string
}

const fetchFeatureGateRules = async (gateId: string): Promise<FeatureGateRule[]> => {
  try {
    const result = await fetcher<FeatureGateResponse>(`/gates/${gateId}/rules`)
    return result.data?.[0]?.rules || []
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useFeatureGateRules = (gateId: string) =>
  useQuery({
    enabled: Boolean(gateId),
    queryFn: () => fetchFeatureGateRules(gateId),
    queryKey: ['feature-gate-rules', gateId],
  })
