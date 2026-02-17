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
      ? { overrides: [], userIDOverrides: [override] }
      : { overrides: [override], userIDOverrides: [] }

    await api.url(`/experiments/${experimentId}/overrides`).post(payload).json()

    // Since we invalidate queries after mutation, we don't strictly need to return the updated list here
    // Unless we want to use it for optimistic updates or display.
    // The previous implementation filtered and mapped userIDOverrides.
    // We'll return an empty array for now as we rely on query invalidation.

    return {
      // eslint-disable-next-line unicorn/no-null
      data: [],
      error: undefined,
      success: true,
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
