import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

export interface Override {
  environment?: string
  groupID: string
  ids: string[]
  passingPercentage?: number
}

interface CreateOverrideArgs {
  experimentId: string
  override: Override
}

interface CreateOverrideResponse {
  data: Override[] | null
  error?: string
  success: boolean
}

const HTTP_OK = 200
const HTTP_UNAUTHORIZED = 401

/**
 * Creates a user override for a specific experiment.
 *
 * @param args - The arguments for creating an override
 * @param args.experimentId - The ID of the experiment
 * @param args.override - The override details (user IDs, group ID)
 * @returns A promise resolving to the updated list of overrides or an error
 */
export const createOverride = async ({
  experimentId,
  override,
}: CreateOverrideArgs): Promise<CreateOverrideResponse> => {
  try {
    const { data, status } = await api.patch(`/experiments/${experimentId}/overrides`, {
      overrides: [],
      userIDOverrides: [override],
    })

    if (status === HTTP_UNAUTHORIZED) {
      return {
        // eslint-disable-next-line unicorn/no-null
        data: null,
        error: 'Invalid Statsig Console API Key, please try again with a valid key.',
        success: false,
      }
    }

    const overrides = data?.data?.userIDOverrides
      ?.filter((override: Override) => override.ids.length > 0)
      .map((override: Override) => Object.assign(override, { environment: undefined }))

    return {
      // eslint-disable-next-line unicorn/no-null
      data: overrides ?? null,
      error: undefined,
      success: status === HTTP_OK,
    }
  } catch (error) {
    console.error('Failed to create override:', error)
    return {
      // eslint-disable-next-line unicorn/no-null
      data: null,
      error: handleApiError(error),
      success: false,
    }
  }
}
