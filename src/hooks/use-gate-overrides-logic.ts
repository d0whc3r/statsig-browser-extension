import { useMemo, useState } from 'react'

import type { FeatureGate, GateOverride } from '@/src/types/statsig'

import { useGateOverrideHandlers } from '@/src/hooks/use-gate-override-handlers'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'

type View = 'form' | 'table'

export const useGateOverridesLogic = (
  currentItemId: string | undefined,
  overrides: GateOverride,
  featureGate?: FeatureGate,
) => {
  const [typeApiKey] = useWxtStorage(apiKeyTypeStorage)
  const [view, setView] = useState<View>('table')
  const { data: detectedUser } = useUserDetails()

  const {
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isPending,
  } = useGateOverrideHandlers(currentItemId, setView, overrides)

  const allOverrides = useMemo(() => {
    const result: {
      id: string
      type: 'pass' | 'fail'
      environment: string | null
      idType: string | null
    }[] = []

    // Root overrides (implied default env, userID)
    overrides?.passingUserIDs?.forEach((id) =>
      result.push({
        environment: null,
        id,
        idType: featureGate?.idType || 'userID',
        type: 'pass',
      }),
    )
    overrides?.failingUserIDs?.forEach((id) =>
      result.push({
        environment: null,
        id,
        idType: featureGate?.idType || 'userID',
        type: 'fail',
      }),
    )

    // Environment overrides
    overrides?.environmentOverrides?.forEach((group) => {
      group.passingIDs?.forEach((id) =>
        result.push({
          environment: group.environment,
          id,
          idType: group.unitID,
          type: 'pass',
        }),
      )
      group.failingIDs?.forEach((id) =>
        result.push({
          environment: group.environment,
          id,
          idType: group.unitID,
          type: 'fail',
        }),
      )
    })

    return result
  }, [overrides])

  const canEdit = typeApiKey === 'write-key'

  const detectedUserId = useMemo(() => {
    if (!detectedUser) {
      return
    }

    const idType = featureGate?.idType || 'userID'

    if (idType === 'userID') {
      return (detectedUser.userID || detectedUser.id) as string | undefined
    }

    // Check for customIDs
    const customIDs = detectedUser.customIDs as Record<string, string> | undefined
    if (customIDs && typeof customIDs === 'object' && idType in customIDs) {
      return customIDs[idType]
    }

    // Check top level
    if (idType in detectedUser) {
      return detectedUser[idType] as string
    }

    return
  }, [detectedUser, featureGate])

  const detectedUserOverrides = useMemo(() => {
    if (!detectedUserId) {
      return []
    }

    const currentIdType = featureGate?.idType || 'userID'

    return allOverrides.filter(
      (override) => override.id === detectedUserId && override.idType === currentIdType,
    )
  }, [detectedUserId, allOverrides, featureGate])

  const isDetectedUserOverridden = detectedUserOverrides.length > 0

  return {
    allOverrides,
    canEdit,
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isDetectedUserOverridden,
    isPending,
    view,
  }
}
