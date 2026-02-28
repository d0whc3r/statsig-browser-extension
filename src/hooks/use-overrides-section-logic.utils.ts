import type { AnyOverride, ExperimentOverride, UserIDOverride } from '@/src/types/statsig'

/**
 * Pure logic for updating User ID overrides.
 * This can be unit tested without React or mocks.
 */
export const getUpdatedUserIDOverrides = (
  existing: UserIDOverride[],
  newOverride: UserIDOverride,
): UserIDOverride[] => {
  const [userId] = newOverride.ids
  const env = newOverride.environment || null
  const unitType = newOverride.unitType || 'userID'

  // 1. Remove this userId from any existing override for the SAME environment & item type
  const filtered = existing
    .map((item) => {
      const itemEnv = item.environment || null
      const itemUnitType = item.unitType || 'userID'
      if (itemEnv === env && itemUnitType === unitType) {
        return { ...item, ids: item.ids.filter((id) => id !== userId) }
      }
      return item
    })
    .filter((item) => item.ids.length > 0)

  // 2. Add to the correct entry
  const existingEntry = filtered.find((item) => {
    const itemEnv = item.environment || null
    const itemUnitType = item.unitType || 'userID'
    return item.groupID === newOverride.groupID && itemEnv === env && itemUnitType === unitType
  })

  if (existingEntry) {
    if (!existingEntry.ids.includes(userId)) {
      existingEntry.ids.push(userId)
    }
    return filtered
  }

  return [...filtered, newOverride]
}

/**
 * Pure logic for deleting an override.
 */
export const getDeletedOverrides = (
  existingUserIDOverrides: UserIDOverride[],
  existingOverrides: ExperimentOverride[],
  overrideToDelete: AnyOverride,
): { userIDOverrides: UserIDOverride[]; overrides: ExperimentOverride[] } => {
  let updatedUserIDOverrides = [...existingUserIDOverrides]
  let updatedOverrides = [...existingOverrides]

  if ('ids' in overrideToDelete) {
    const [userId] = overrideToDelete.ids
    const env = overrideToDelete.environment || null
    const unitType = overrideToDelete.unitType || 'userID'

    updatedUserIDOverrides = updatedUserIDOverrides
      .map((item) => {
        const itemEnv = item.environment || null
        const itemUnitType = item.unitType || 'userID'
        if (itemEnv === env && itemUnitType === unitType) {
          return { ...item, ids: item.ids.filter((id) => id !== userId) }
        }
        return item
      })
      .filter((item) => item.ids.length > 0)
  } else {
    updatedOverrides = updatedOverrides.filter(
      (item) =>
        item.groupID !== overrideToDelete.groupID ||
        item.name !== overrideToDelete.name ||
        item.type !== overrideToDelete.type,
    )
  }

  return { overrides: updatedOverrides, userIDOverrides: updatedUserIDOverrides }
}
