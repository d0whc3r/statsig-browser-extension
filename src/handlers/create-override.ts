import type { ExperimentOverride, UserIDOverride } from '@/src/types/statsig'

import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

export type Override = UserIDOverride
export type AnyOverride = UserIDOverride | ExperimentOverride

interface CreateOverrideArgs {
  experimentId: string
  override: AnyOverride
}

interface CreateOverrideResponse {
  data: AnyOverride[] | null
  error?: string
  success: boolean
}

const HTTP_OK = 200
const HTTP_UNAUTHORIZED = 401

function isUserIDOverride(override: AnyOverride): override is UserIDOverride {
  return 'ids' in override
}

/**
 * Creates an override for a specific experiment.
 *
 * @param args - The arguments for creating an override
 * @param args.experimentId - The ID of the experiment
 * @param args.override - The override details (user IDs, group ID, or gate/segment override)
 * @returns A promise resolving to the updated list of overrides or an error
 */
export const createOverride = async ({
  experimentId,
  override,
}: CreateOverrideArgs): Promise<CreateOverrideResponse> => {
  try {
    const payload = isUserIDOverride(override)
      ? { userIDOverrides: [override], overrides: [] }
      : { userIDOverrides: [], overrides: [override] }

    const { data, status } = await api.post(`/experiments/${experimentId}/overrides`, payload)

    if (status === HTTP_UNAUTHORIZED) {
      return {
        // eslint-disable-next-line unicorn/no-null
        data: null,
        error: 'Invalid Statsig Console API Key, please try again with a valid key.',
        success: false,
      }
    }

    // Since we invalidate queries after mutation, we don't strictly need to return the updated list here
    // unless we want to use it for optimistic updates or display.
    // The previous implementation filtered and mapped userIDOverrides.
    // We'll return an empty array for now as we rely on query invalidation.

    return {
      // eslint-disable-next-line unicorn/no-null
      data: [],
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
