import { useCallback, useMemo, useState } from 'react'

import type { ExperimentOverride, UserIDOverride } from '@/src/types/statsig'

import { useExperiment } from '@/src/hooks/use-experiment'
import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'
import { getDetectedUserId } from '@/src/lib/user-utils'
import { useUIStore } from '@/src/store/use-ui-store'

type View = 'form' | 'table'
export type OverrideType = 'user' | 'gate' | 'segment'

interface OverridesData {
  userIDOverrides: UserIDOverride[]
  overrides: ExperimentOverride[]
}

const useOverridesFormState = (
  onSuccess: () => void,
  currentItemId: string | undefined,
  currentData: OverridesData | undefined,
) => {
  const { deleteMutation, isPending, updateMutation } = useExperimentMutations({
    currentItemId: currentItemId ?? '',
    onAddSuccess: () => {
      onSuccess()
    },
    onDeleteSuccess: () => {
      onSuccess()
    },
  })

  const getUpdatedUserIDOverrides = useCallback(
    (existing: UserIDOverride[], newOverride: UserIDOverride) => {
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
    },
    [],
  )

  const addOverride = useCallback(
    (newOverride: UserIDOverride | ExperimentOverride) => {
      if (!currentItemId || !currentData) {
        return
      }

      const payload: OverridesData = {
        overrides: [...(currentData.overrides || [])],
        userIDOverrides: [...(currentData.userIDOverrides || [])],
      }

      if ('ids' in newOverride) {
        payload.userIDOverrides = getUpdatedUserIDOverrides(payload.userIDOverrides, newOverride)
      } else {
        payload.overrides = payload.overrides.filter(
          (override) => override.name !== newOverride.name || override.type !== newOverride.type,
        )
        payload.overrides.push(newOverride)
      }

      updateMutation({
        experimentId: currentItemId,
        overrides: payload,
      })
    },
    [currentItemId, currentData, updateMutation, getUpdatedUserIDOverrides],
  )

  const deleteOverride = useCallback(
    (toRemove: UserIDOverride | ExperimentOverride) => {
      if (!currentItemId || !currentData) {
        return
      }

      const payload: OverridesData = {
        overrides: [],
        userIDOverrides: [],
      }

      if ('ids' in toRemove) {
        // User ID override cleanup
        const clean: UserIDOverride = {
          environment: toRemove.environment || null,
          groupID: toRemove.groupID,
          ids: toRemove.ids,
          unitType: toRemove.unitType || 'userID',
        }
        payload.userIDOverrides = [clean]
      } else {
        // Experiment override (gate/segment) cleanup
        const clean: ExperimentOverride = {
          groupID: toRemove.groupID,
          name: toRemove.name,
          type: toRemove.type,
        }
        payload.overrides = [clean]
      }

      deleteMutation({
        experimentId: currentItemId,
        overrides: payload,
      })
    },
    [currentItemId, currentData, deleteMutation],
  )

  return {
    addOverride,
    deleteOverride,
    isPending,
  }
}

const useOverrideData = (currentItemId: string | undefined) => {
  const { data: experiment } = useExperiment(currentItemId)
  const groups = useMemo(() => experiment?.groups || [], [experiment?.groups])

  const { data: featureGatesData } = useFeatureGates()
  const featureGates = useMemo(
    () => featureGatesData?.pages.flatMap((page) => page.data) || [],
    [featureGatesData],
  )

  const { data: detectedUser } = useUserDetails()

  const detectedUserId = useMemo(
    () => getDetectedUserId(detectedUser, experiment?.idType),
    [detectedUser, experiment?.idType],
  )

  const { data: overridesData } = useOverrides(currentItemId)

  const userIDOverrides = useMemo(() => {
    if (!overridesData) {
      return []
    }

    return overridesData.userIDOverrides.map((override) => {
      const idType = override.unitType || 'userID'
      const detectedId = getDetectedUserId(detectedUser, idType)
      const isCurrentUser = detectedId ? override.ids.includes(detectedId) : false
      return { ...override, isCurrentUser }
    })
  }, [overridesData, detectedUser])

  const detectedUserOverrides = useMemo(() => {
    if (!detectedUserId || !overridesData) {
      return []
    }

    const currentIdType = experiment?.idType || 'userID'

    return overridesData.userIDOverrides
      .filter((override) => {
        const hasId = override.ids.includes(detectedUserId)
        const overrideIdType = override.unitType || 'userID'
        return hasId && overrideIdType === currentIdType
      })
      .map((override) => ({
        environment: override.environment || null,
        groupID: override.groupID,
      }))
  }, [detectedUserId, overridesData, experiment?.idType])

  return {
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    experiment,
    featureGates,
    groups,
    isDetectedUserOverridden: detectedUserOverrides.length > 0,
    overridesData: overridesData ? { ...overridesData, userIDOverrides } : undefined,
    rawOverrides: overridesData,
  }
}

export const useOverridesSectionLogic = () => {
  const [typeApiKey] = useWxtStorage(apiKeyTypeStorage)
  const [view, setView] = useState<View>('table')
  const { currentItemId } = useUIStore((state) => state)

  const {
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    experiment,
    featureGates,
    groups,
    isDetectedUserOverridden,
    overridesData,
    rawOverrides,
  } = useOverrideData(currentItemId)

  const { addOverride, deleteOverride, isPending } = useOverridesFormState(
    () => setView('table'),
    currentItemId,
    rawOverrides,
  )

  const handleCreateOverrideClick = useCallback(() => setView('form'), [])
  const handleBackClick = useCallback(() => setView('table'), [])

  return {
    addOverride,
    currentItemId,
    deleteOverride,
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    experiment,
    featureGates,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    isDetectedUserOverridden,
    isPending,
    overridesData,
    typeApiKey,
    view,
  }
}
