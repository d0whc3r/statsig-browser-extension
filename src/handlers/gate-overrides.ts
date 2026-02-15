import type { GateOverride } from '@/src/types/statsig'

import { api, poster } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

interface UpdateGateOverridesArgs {
  gateId: string
  overrides: GateOverride
}

interface DeleteGateOverridesArgs {
  gateId: string
  overrides: Partial<GateOverride>
}

interface ApiResponse<DataType> {
  data: DataType
  message?: string
}

export const updateGateOverrides = async ({
  gateId,
  overrides,
}: UpdateGateOverridesArgs): Promise<GateOverride> => {
  try {
    const result = await poster<ApiResponse<GateOverride>>(`/gates/${gateId}/overrides`, overrides)
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const deleteGateOverrides = async ({
  gateId,
  overrides,
}: DeleteGateOverridesArgs): Promise<GateOverride> => {
  try {
    const result = await api.delete<ApiResponse<GateOverride>>(`/gates/${gateId}/overrides`, {
      data: overrides,
    })
    return result.data.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}
