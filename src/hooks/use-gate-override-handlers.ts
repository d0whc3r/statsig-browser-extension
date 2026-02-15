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
  // Root fields only support userID. For other ID types, we must use environmentOverrides even if environment is null (global)
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
  currentOverrides?: GateOverride,
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

      // Clone current overrides or start fresh
      const payload: GateOverride = currentOverrides
        ? (structuredClone(currentOverrides) as GateOverride)
        : {
            environmentOverrides: [],
            failingUserIDs: [],
            passingUserIDs: [],
          }

      // Ensure arrays exist
      payload.passingUserIDs = payload.passingUserIDs || []
      payload.failingUserIDs = payload.failingUserIDs || []
      payload.environmentOverrides = payload.environmentOverrides || []

      // Root overrides only support userID
      const isRoot = !environment && (!idType || idType === 'userID')

      if (isRoot) {
        // Root overrides
        if (targetType === 'pass') {
          if (!payload.passingUserIDs.includes(targetUserId)) {
            payload.passingUserIDs.push(targetUserId)
          }
          // Remove from failing if present to avoid conflicts, or leave it to server?
          // To be safe and consistent with "add separately", we simply add.
          // But cleaning up the other list is good practice.
          // However, based on "don't overwrite", we'll just add.
        } else {
          if (!payload.failingUserIDs.includes(targetUserId)) {
            payload.failingUserIDs.push(targetUserId)
          }
        }
      } else {
        // Environment overrides
        let envGroup = payload.environmentOverrides.find(
          (g) => g.environment === environment && g.unitID === idType,
        )

        if (!envGroup) {
          envGroup = {
            environment,
            failingIDs: [],
            passingIDs: [],
            unitID: idType,
          }
          payload.environmentOverrides.push(envGroup)
        }

        envGroup.passingIDs = envGroup.passingIDs || []
        envGroup.failingIDs = envGroup.failingIDs || []

        if (targetType === 'pass') {
          if (!envGroup.passingIDs.includes(targetUserId)) {
            envGroup.passingIDs.push(targetUserId)
          }
        } else {
          if (!envGroup.failingIDs.includes(targetUserId)) {
            envGroup.failingIDs.push(targetUserId)
          }
        }
      }

      updateMutate({
        gateId: currentItemId,
        overrides: payload,
      })
    },
    [currentItemId, updateMutate, currentOverrides],
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
