import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { deleteGateOverrides, updateGateOverrides } from '@/src/handlers/gate-overrides'

import type { OverrideType } from '../components/modals/manage-gate-overrides/types'

const updateList = (list: string[], id: string, add: boolean): string[] => {
  const newList = list.filter((item) => item !== id)
  if (add) {
    newList.push(id)
  }
  return newList
}

const updateOverrides = (
  overrides: GateOverride,
  targetId: string,
  targetType: OverrideType,
  environment: string | null,
  idType: string | null,
  isDelete = false,
): GateOverride => {
  // Deep copy manually to avoid structuredClone issues if any, though structuredClone is standard now
  const updated: GateOverride = structuredClone(overrides) as GateOverride

  // Determine if we are targeting root fields or environmentOverrides
  // If environment is null AND (idType is null or 'userID'), use root fields
  const isRoot = !environment && (!idType || idType === 'userID')

  if (isRoot) {
    if (targetType === 'pass') {
      updated.passingUserIDs = updateList(updated.passingUserIDs, targetId, !isDelete)
      if (!isDelete) {
        updated.failingUserIDs = updateList(updated.failingUserIDs, targetId, false)
      }
    } else {
      updated.failingUserIDs = updateList(updated.failingUserIDs, targetId, !isDelete)
      if (!isDelete) {
        updated.passingUserIDs = updateList(updated.passingUserIDs, targetId, false)
      }
    }
  } else {
    // Ensure environmentOverrides exists
    if (!updated.environmentOverrides) {
      updated.environmentOverrides = []
    }

    // Find or create environment group
    let groupIndex = updated.environmentOverrides.findIndex(
      (g) => g.environment === environment && g.unitID === idType,
    )

    if (groupIndex === -1 && !isDelete) {
      updated.environmentOverrides.push({
        environment,
        failingIDs: [],
        passingIDs: [],
        unitID: idType,
      })
      groupIndex = updated.environmentOverrides.length - 1
    }

    if (groupIndex !== -1) {
      const group = updated.environmentOverrides[groupIndex]
      if (targetType === 'pass') {
        group.passingIDs = updateList(group.passingIDs, targetId, !isDelete)
        if (!isDelete) {
          group.failingIDs = updateList(group.failingIDs, targetId, false)
        }
      } else {
        group.failingIDs = updateList(group.failingIDs, targetId, !isDelete)
        if (!isDelete) {
          group.passingIDs = updateList(group.passingIDs, targetId, false)
        }
      }

      // Cleanup empty groups
      if (group.passingIDs.length === 0 && group.failingIDs.length === 0) {
        updated.environmentOverrides.splice(groupIndex, 1)
      }
    }
  }

  return updated
}

const createDeletePayload = (
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
  overrides: GateOverride,
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

      const updated = updateOverrides(
        overrides,
        targetUserId,
        targetType,
        environment,
        idType,
        false,
      )

      updateMutate({
        gateId: currentItemId,
        overrides: updated,
      })
    },
    [currentItemId, overrides, updateMutate],
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

      const payload = createDeletePayload(idToRemove, type, environment, idType)

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
