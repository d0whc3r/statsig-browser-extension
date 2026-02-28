import type {
  ExperimentOverridesResponse,
  UserIDOverride,
  ExperimentOverride,
} from '@/src/types/statsig'

export interface OverridesData {
  userIDOverrides: UserIDOverride[]
  overrides: ExperimentOverride[]
}

/**
 * Transforms the API response into the application's OverridesData format.
 */
export const transformOverridesResponse = (
  response: ExperimentOverridesResponse,
): OverridesData => ({
  overrides: response.overrides || [],
  userIDOverrides: (response.userIDOverrides || []).filter((override) => override.ids.length > 0),
})
