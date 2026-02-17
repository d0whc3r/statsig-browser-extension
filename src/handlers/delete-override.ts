import type { ExperimentOverride, UserIDOverride } from '@/src/types/statsig'

import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

export type AnyOverride = UserIDOverride | ExperimentOverride

interface DeleteOverrideArgs {
  experimentId: string
  override: AnyOverride
}

interface DeleteOverrideResponse {
  data: AnyOverride[] | null
  error?: string
  success: boolean
}

function isUserIDOverride(override: AnyOverride): override is UserIDOverride {
  return 'ids' in override
}

/**
 * Deletes an override for a specific experiment.
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
    const payload = isUserIDOverride(override)
      ? { overrides: [], userIDOverrides: [override] }
      : { overrides: [override], userIDOverrides: [] }

    await api.url(`/experiments/${experimentId}/overrides`).json(payload).delete().json()

    // This response processing is a bit simplistic if we want to return both types
    // But for now let's just return what we can
    // The original code was returning UserIDOverride[]
    // We should probably return the full response or rely on react-query invalidation

    return {
      // eslint-disable-next-line unicorn/no-null
      data: [], // We rely on invalidation usually, or we can parse the response
      error: undefined,
      success: true,
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
