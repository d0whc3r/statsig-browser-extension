import type { Override } from './create-override'

import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

interface DeleteOverrideArgs {
  experimentId: string
  override: Override
}

interface DeleteOverrideResponse {
  data: Override[] | null
  error?: string
  success: boolean
}

const HTTP_OK = 200
const HTTP_UNAUTHORIZED = 401

/**
 * Deletes a user override for a specific experiment.
 *
 * @param args - The arguments for deleting an override
 * @param args.experimentId - The ID of the experiment
 * @param args.override - The override details to match for deletion
 * @returns A promise resolving to the updated list of overrides or an error
 */
export const deleteOverride = async ({
  experimentId,
  override,
}: DeleteOverrideArgs): Promise<DeleteOverrideResponse> => {
  try {
    const { data, status } = await api.delete(`/experiments/${experimentId}/overrides`, {
      data: {
        overrides: [],
        userIDOverrides: [override],
      },
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
    console.error('Failed to delete override:', error)
    return {
      // eslint-disable-next-line unicorn/no-null
      data: null,
      error: handleApiError(error),
      success: false,
    }
  }
}
