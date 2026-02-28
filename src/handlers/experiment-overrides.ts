import type { ExperimentOverridesResponse } from '@/src/types/statsig'

import { api, poster } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

interface UpdateExperimentOverridesArgs {
  experimentId: string
  overrides: ExperimentOverridesResponse
}

interface DeleteExperimentOverridesArgs {
  experimentId: string
  overrides: Partial<ExperimentOverridesResponse>
}

interface ApiResponse<DataType> {
  data: DataType
  message?: string
}

export const updateExperimentOverrides = async ({
  experimentId,
  overrides,
}: UpdateExperimentOverridesArgs): Promise<ExperimentOverridesResponse> => {
  try {
    const result = await poster<ApiResponse<ExperimentOverridesResponse>>(
      `/experiments/${experimentId}/overrides`,
      overrides,
    )
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const deleteExperimentOverrides = async ({
  experimentId,
  overrides,
}: DeleteExperimentOverridesArgs): Promise<ExperimentOverridesResponse> => {
  try {
    const result = await api
      .url(`/experiments/${experimentId}/overrides`)
      .json(overrides)
      .delete()
      .json<ApiResponse<ExperimentOverridesResponse>>()
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}
