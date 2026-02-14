import { useMemo, useState } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { useGateOverrideHandlers } from '@/src/hooks/use-gate-override-handlers'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useUserDetails } from '@/src/hooks/use-user-details'

type View = 'form' | 'table'

export const useGateOverridesLogic = (
  currentItemId: string | undefined,
  overrides: GateOverride,
) => {
  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'write-key')
  const [view, setView] = useState<View>('table')
  const { data: detectedUser } = useUserDetails()

  const {
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isPending,
  } = useGateOverrideHandlers(currentItemId, overrides, setView)

  const allOverrides = useMemo(
    () => [
      ...overrides.passingUserIDs.map((id: string) => ({ id, type: 'pass' as const })),
      ...overrides.failingUserIDs.map((id: string) => ({ id, type: 'fail' as const })),
    ],
    [overrides],
  )

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
