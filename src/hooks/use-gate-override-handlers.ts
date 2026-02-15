import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { deleteGateOverrides, updateGateOverrides } from '@/src/handlers/gate-overrides'

import type { OverrideType } from '../components/modals/manage-gate-overrides/types'

const createPayload = (
  targetId: string,
  targetType: OverrideType,
  environment: string | null,
  idType: string | null,
): Partial<GateOverride> => {
  const payload: Partial<GateOverride> = {}

  // Determine if we are targeting root fields or environmentOverrides
  const isRoot = !environment && (!idType || idType === 'userID')

  if (isRoot) {
    if (targetType === 'pass') {
      payload.passingUserIDs = [targetId]
    } else {
      payload.failingUserIDs = [targetId]
    }
  } else {
    payload.environmentOverrides = [
      {
        environment: environment!,
        failingIDs: targetType === 'fail' ? [targetId] : [],
        passingIDs: targetType === 'pass' ? [targetId] : [],
        unitID: idType!,
      },
    ]
  }
  return payload
}

export const useGateOverrideHandlers = (
  currentItemId: string | undefined,
  setView: (view: 'form' | 'table') => void,
) => {
  const queryClient = useQueryClient()

  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: updateGateOverrides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate-overrides', currentItemId] })
      setView('table')
    },
  })

  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: deleteGateOverrides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate-overrides', currentItemId] })
    },
  })

  const handleAddOverride = useCallback(
    (
      targetUserId: string,
      targetType: OverrideType,
      environment: string | null = null,
      idType: string | null = 'userID',
    ) => {
      if (!currentItemId) {
        return
      }

      const payload = createPayload(targetUserId, targetType, environment, idType)

      updateMutate({
        gateId: currentItemId,
        overrides: payload as GateOverride,
      })
    },
    [currentItemId, updateMutate],
  )

  const handleDeleteOverride = useCallback(
    (
      idToRemove: string,
      type: OverrideType,
      environment: string | null = null,
      idType: string | null = 'userID',
    ) => {
      if (!currentItemId) {
        return
      }

      const payload = createPayload(idToRemove, type, environment, idType)

      deleteMutate({
        gateId: currentItemId,
        overrides: payload,
      })
    },
    [currentItemId, deleteMutate],
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
    isPending: isUpdatePending || isDeletePending,
  }
}
