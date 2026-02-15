import { useMemo, useState } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { useGateOverrideHandlers } from '@/src/hooks/use-gate-override-handlers'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'

type View = 'form' | 'table'

export const useGateOverridesLogic = (
  currentItemId: string | undefined,
  overrides: GateOverride,
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
  } = useGateOverrideHandlers(currentItemId, setView)

  const allOverrides = useMemo(() => {
    const result: {
      id: string
      type: 'pass' | 'fail'
      environment: string | null
      idType: string | null
    }[] = []

    // Root overrides (implied default env, userID)
    overrides?.passingUserIDs?.forEach((id) =>
      result.push({ environment: null, id, idType: 'userID', type: 'pass' }),
    )
    overrides?.failingUserIDs?.forEach((id) =>
      result.push({ environment: null, id, idType: 'userID', type: 'fail' }),
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

  const detectedUserId = (detectedUser?.userID || (detectedUser as Record<string, unknown>)?.id) as
    | string
    | undefined
  const isDetectedUserOverridden = detectedUserId
    ? allOverrides.some((override) => override.id === detectedUserId)
    : false

  return {
    allOverrides,
    canEdit,
    detectedUser,
    detectedUserId,
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isDetectedUserOverridden,
    isPending,
    view,
  }
}
