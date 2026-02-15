import { useCallback, useMemo, useState } from 'react'

import type { AnyOverride } from '@/src/handlers/create-override'

import { useExperiment } from '@/src/hooks/use-experiment'
import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

type View = 'form' | 'table'
export type OverrideType = 'user' | 'gate' | 'segment'

const useOverridesFormState = (onSuccess: () => void, currentItemId: string | undefined) => {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [overrideType, setOverrideType] = useState<OverrideType>('user')
  const [overrideValue, setOverrideValue] = useState('')

  const {
    addMutation: mutate,
    deleteMutation,
    isAdding,
    isDeleting,
  } = useExperimentMutations({
    currentItemId: currentItemId ?? '',
    onAddSuccess: () => {
      onSuccess()
      setOverrideValue('')
      setSelectedGroup('')
      setOverrideType('user')
    },
  })

  const addOverride = useCallback(
    (userId?: string, groupId?: string) => {
      if (!currentItemId) {
        return
      }

      let override: AnyOverride

      const id = userId || overrideValue
      const group = groupId || selectedGroup

      if (overrideType === 'user' || userId) {
        override = { groupID: group, ids: [id] }
      } else {
        override = { groupID: group, name: id, type: overrideType }
      }

      mutate({
        experimentId: currentItemId,
        override,
      })
    },
    [currentItemId, mutate, selectedGroup, overrideValue, overrideType],
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
    overrideType,
    overrideValue,
    selectedGroup,
    setOverrideType,
    setOverrideValue,
    setSelectedGroup,
  }
}

export const useOverridesSectionLogic = () => {
  const [typeApiKey] = useWxtStorage(apiKeyTypeStorage)
  const [view, setView] = useState<View>('table')
  const { currentItemId } = useUIStore((state) => state)
  const { data: experiment } = useExperiment(currentItemId)
  const groups = useMemo(() => experiment?.groups || [], [experiment?.groups])

  const { data: featureGatesData } = useFeatureGates()
  const featureGates = useMemo(
    () => featureGatesData?.pages.flatMap((page) => page.data) || [],
    [featureGatesData],
  )

  const { data: detectedUser } = useUserDetails()

  const detectedUserId = (detectedUser?.userID || (detectedUser as Record<string, unknown>)?.id) as
    | string
    | undefined

  const { data: overridesData } = useOverrides(currentItemId)

  const isDetectedUserOverridden = useMemo(() => {
    if (!detectedUserId || !overridesData) {
      return false
    }
    return overridesData.userIDOverrides.some((o) => o.ids.includes(detectedUserId))
  }, [detectedUserId, overridesData])

  const {
    addOverride,
    deleteOverride,
    isPending,
    overrideValue,
    selectedGroup,
    setOverrideValue,
    setSelectedGroup,
    overrideType,
    setOverrideType,
  } = useOverridesFormState(() => setView('table'), currentItemId)

  const handleCreateOverrideClick = useCallback(() => setView('form'), [])
  const handleBackClick = useCallback(() => setView('table'), [])
  const handleOverrideValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setOverrideValue(event.target.value),
    [setOverrideValue],
  )

  return {
    addOverride,
    currentItemId,
    deleteOverride,
    detectedUser,
    detectedUserId,
    featureGates,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    handleOverrideValueChange,
    isDetectedUserOverridden,
    isPending,
    overrideType,
    overrideValue,
    overridesData,
    selectedGroup,
    setOverrideType,
    setOverrideValue,
    setSelectedGroup,
    typeApiKey,
    view,
  }
}
