import { useQuery } from '@tanstack/react-query'

import type { ExperimentOverridesResponse, UserIDOverride } from '@/src/types/statsig'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

export type Override = UserIDOverride

interface ApiResponse<DataType> {
  data: DataType
}

const fetchOverrides = async (experimentId: string): Promise<Override[]> => {
  try {
    const result = await fetcher<ApiResponse<ExperimentOverridesResponse>>(
      `/experiments/${experimentId}/overrides`,
    )
    return result.data.userIDOverrides.filter((override) => override.ids.length > 0)
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
