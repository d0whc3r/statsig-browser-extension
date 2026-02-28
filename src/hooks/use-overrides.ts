import { useQuery } from '@tanstack/react-query'

import type { ExperimentOverridesResponse, UserIDOverride } from '@/src/types/statsig'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { OverridesData } from './use-overrides.utils'

import { transformOverridesResponse } from './use-overrides.utils'

export type Override = UserIDOverride

interface ApiResponse<DataType> {
  data: DataType
}

const fetchOverrides = async (experimentId: string): Promise<OverridesData> => {
  try {
    const result = await fetcher<ApiResponse<ExperimentOverridesResponse>>(
      `/experiments/${experimentId}/overrides`,
    )
    return transformOverridesResponse(result.data)
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useOverrides = (experimentId?: string) =>
  useQuery({
    enabled: Boolean(experimentId),
    queryFn: () => fetchOverrides(experimentId!),
    queryKey: ['overrides', experimentId],
  })
