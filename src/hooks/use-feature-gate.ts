import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { FeatureGate } from '../types/statsig'

interface ApiResponse<TData> {
  data: TData
}

const fetchFeatureGate = async (gateId: string): Promise<FeatureGate> => {
  try {
    const result = await fetcher<ApiResponse<FeatureGate>>(`/gates/${gateId}`)
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useFeatureGate = (gateId?: string) =>
  useQuery({
    enabled: Boolean(gateId),
    queryFn: () => {
      if (!gateId) {
        throw new Error('Gate ID is required')
      }
      return fetchFeatureGate(gateId)
    },
    queryKey: ['feature-gate', gateId],
  })
