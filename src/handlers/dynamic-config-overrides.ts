import type { DynamicConfigOverride } from '@/src/types/statsig'

import { api } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

interface DynamicConfigOverridesResponse {
  userIDOverrides: DynamicConfigOverride[]
}

interface ApiResponse<DataType> {
  data: DataType
}

export const fetchDynamicConfigOverrides = async (
  configId: string,
): Promise<DynamicConfigOverride[]> => {
  try {
    const result = await api.get<ApiResponse<DynamicConfigOverridesResponse>>(
      `/dynamic_configs/${configId}/overrides`,
    )
    return result.data.data.userIDOverrides
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const addDynamicConfigOverride = async (
  configId: string,
  override: { ids: string[]; returnValue: Record<string, unknown> },
): Promise<DynamicConfigOverride[]> => {
  try {
    // Based on experiment override pattern, we likely patch the list
    // Or simpler: send the override to be added/merged
    const { data } = await api.patch<ApiResponse<DynamicConfigOverridesResponse>>(
      `/dynamic_configs/${configId}/overrides`,
      {
        userIDOverrides: [override],
      },
    )
    return data.data.userIDOverrides
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const deleteDynamicConfigOverride = async (
  configId: string,
  override: { ids: string[]; returnValue: Record<string, unknown> },
): Promise<DynamicConfigOverride[]> => {
  try {
    const { data } = await api.delete<ApiResponse<DynamicConfigOverridesResponse>>(
      `/dynamic_configs/${configId}/overrides`,
      {
        data: {
          userIDOverrides: [override],
        },
      },
    )
    return data.data.userIDOverrides
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}
