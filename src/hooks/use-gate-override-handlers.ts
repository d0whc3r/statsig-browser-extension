import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { updateGateOverrides } from '@/src/handlers/gate-overrides'

import type { OverrideType } from '../components/modals/manage-gate-overrides/types'

const createUpdatedOverrides = (
  overrides: GateOverride,
  targetUserId: string,
  targetType: OverrideType,
): GateOverride => {
  const updated = {
    ...overrides,
    failingUserIDs: [...overrides.failingUserIDs],
    passingUserIDs: [...overrides.passingUserIDs],
  }

  if (targetType === 'pass') {
    if (!updated.passingUserIDs.includes(targetUserId)) {
      updated.passingUserIDs.push(targetUserId)
    }
    updated.failingUserIDs = updated.failingUserIDs.filter((id) => id !== targetUserId)
  } else {
    if (!updated.failingUserIDs.includes(targetUserId)) {
      updated.failingUserIDs.push(targetUserId)
    }
    updated.passingUserIDs = updated.passingUserIDs.filter((id) => id !== targetUserId)
  }

  return updated
}

const removeOverride = (
  overrides: GateOverride,
  idToRemove: string,
  type: OverrideType,
): GateOverride => {
  const updated = {
    ...overrides,
    failingUserIDs: [...overrides.failingUserIDs],
    passingUserIDs: [...overrides.passingUserIDs],
  }

  if (type === 'pass') {
    updated.passingUserIDs = updated.passingUserIDs.filter((id) => id !== idToRemove)
  } else {
    updated.failingUserIDs = updated.failingUserIDs.filter((id) => id !== idToRemove)
  }

  return updated
}

export const useGateOverrideHandlers = (
  currentItemId: string | undefined,
  overrides: GateOverride,
  setView: (view: 'form' | 'table') => void,
) => {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: updateGateOverrides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate-overrides', currentItemId] })
      setView('table')
    },
  })

  const handleAddOverride = useCallback(
    (targetUserId: string, targetType: OverrideType) => {
      if (!currentItemId) {
        return
      }

      const updated = createUpdatedOverrides(overrides, targetUserId, targetType)

      mutate({
        gateId: currentItemId,
        overrides: updated,
      })
    },
    [currentItemId, overrides, mutate],
  )

  const handleDeleteOverride = useCallback(
    (idToRemove: string, type: OverrideType) => {
      if (!currentItemId) {
        return
      }

      const updated = removeOverride(overrides, idToRemove, type)

      mutate({
        gateId: currentItemId,
        overrides: updated,
      })
    },
    [currentItemId, overrides, mutate],
  )

  const handleSwitchToForm = useCallback(() => {
    setView('form')
  }, [setView])

  const handleSwitchToTable = useCallback(() => {
    setView('table')
  }, [setView])

  return {
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
    isPending,
  }
}
