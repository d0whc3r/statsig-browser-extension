import { useMemo, useState } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { useGateOverrideHandlers } from '@/src/hooks/use-gate-override-handlers'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { STORAGE_KEYS } from '@/src/lib/storage-keys'

type View = 'form' | 'table'

export const useGateOverridesLogic = (
  currentItemId: string | undefined,
  overrides: GateOverride,
) => {
  const [typeApiKey] = useLocalStorage(STORAGE_KEYS.API_KEY_TYPE, 'write-key')
  const [view, setView] = useState<View>('table')
  const { data: detectedUser } = useUserDetails()

  const {
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isPending,
  } = useGateOverrideHandlers(currentItemId, overrides, setView)

  const allOverrides = useMemo(() => {
    const result: {
      id: string
      type: 'pass' | 'fail'
      environment: string | null
      idType: string | null
    }[] = []

    // Root overrides (implied default env, userID)
    overrides.passing_user_ids.forEach((id) =>
      result.push({ id, type: 'pass', environment: null, idType: 'userID' }),
    )
    overrides.failing_user_ids.forEach((id) =>
      result.push({ id, type: 'fail', environment: null, idType: 'userID' }),
    )

    // Environment overrides
    overrides.environment_overrides?.forEach((group) => {
      group.passing_ids.forEach((id) =>
        result.push({
          id,
          type: 'pass',
          environment: group.environment,
          idType: group.unit_id,
        }),
      )
      group.failing_ids.forEach((id) =>
        result.push({
          id,
          type: 'fail',
          environment: group.environment,
          idType: group.unit_id,
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
