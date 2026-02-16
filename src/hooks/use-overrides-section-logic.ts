import { useCallback, useMemo, useState } from 'react'

import type { AnyOverride } from '@/src/handlers/create-override'
import type { StatsigUser } from '@/src/types/statsig'

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

const useOverridesFormState = (onSuccess: () => void, currentItemId: string | undefined) => {
  const {
    addMutation: mutate,
    deleteMutation,
    isAdding,
    isDeleting,
  } = useExperimentMutations({
    currentItemId: currentItemId ?? '',
    onAddSuccess: () => {
      onSuccess()
    },
  })

  const addOverride = useCallback(
    (override: AnyOverride) => {
      if (!currentItemId) {
        return
      }

      mutate({
        experimentId: currentItemId,
        override,
      })
    },
    [currentItemId, mutate],
  )

  const deleteOverride = useCallback(
    (override: AnyOverride) => {
      if (!currentItemId) {
        return
      }
      deleteMutation({
        experimentId: currentItemId,
        override,
      })
    },
    [currentItemId, deleteMutation],
  )

  return {
    addOverride,
    deleteOverride,
    isPending: isAdding || isDeleting,
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
    () => getDetectedUserId(detectedUser as StatsigUser | undefined, experiment?.idType),
    [detectedUser, experiment?.idType],
  )

  const { data: overridesData } = useOverrides(currentItemId)

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
    overridesData,
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
  } = useOverrideData(currentItemId)

  const { addOverride, deleteOverride, isPending } = useOverridesFormState(
    () => setView('table'),
    currentItemId,
  )

  const handleCreateOverrideClick = useCallback(() => setView('form'), [])
  const handleBackClick = useCallback(() => setView('table'), [])

  return {
    addOverride,
    currentItemId,
    deleteOverride,
    detectedUser,
    detectedUserId,
    detectedUserOverrides, // Added this
    experiment, // Added this
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
