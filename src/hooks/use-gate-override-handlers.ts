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
  isDelete: boolean = false,
): GateOverride => {
  // Deep copy manually to avoid structuredClone issues if any, though structuredClone is standard now
  const updated: GateOverride = JSON.parse(JSON.stringify(overrides)) as GateOverride

  // Determine if we are targeting root fields or environmentOverrides
  // If environment is null AND (idType is null or 'userID'), use root fields
  const isRoot = !environment && (!idType || idType === 'userID')

  if (isRoot) {
    if (targetType === 'pass') {
      updated.passing_user_ids = updateList(updated.passing_user_ids, targetId, !isDelete)
      if (!isDelete) {
        updated.failing_user_ids = updateList(updated.failing_user_ids, targetId, false)
      }
    } else {
      updated.failing_user_ids = updateList(updated.failing_user_ids, targetId, !isDelete)
      if (!isDelete) {
        updated.passing_user_ids = updateList(updated.passing_user_ids, targetId, false)
      }
    }
  } else {
    // Ensure environment_overrides exists
    if (!updated.environment_overrides) {
      updated.environment_overrides = []
    }

    // Find or create environment group
    let groupIndex = updated.environment_overrides.findIndex(
      (g) => g.environment === environment && g.unit_id === idType,
    )

    if (groupIndex === -1 && !isDelete) {
      updated.environment_overrides.push({
        environment,
        unit_id: idType,
        passing_ids: [],
        failing_ids: [],
      })
      groupIndex = updated.environment_overrides.length - 1
    }

    if (groupIndex !== -1) {
      const group = updated.environment_overrides[groupIndex]
      if (targetType === 'pass') {
        group.passing_ids = updateList(group.passing_ids, targetId, !isDelete)
        if (!isDelete) {
          group.failing_ids = updateList(group.failing_ids, targetId, false)
        }
      } else {
        group.failing_ids = updateList(group.failing_ids, targetId, !isDelete)
        if (!isDelete) {
          group.passing_ids = updateList(group.passing_ids, targetId, false)
        }
      }

      // Cleanup empty groups
      if (group.passing_ids.length === 0 && group.failing_ids.length === 0) {
        updated.environment_overrides.splice(groupIndex, 1)
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
      payload.passing_user_ids = [targetId]
    } else {
      payload.failing_user_ids = [targetId]
    }
  } else {
    payload.environment_overrides = [
      {
        environment: environment!,
        unit_id: idType!,
        passing_ids: targetType === 'pass' ? [targetId] : [],
        failing_ids: targetType === 'fail' ? [targetId] : [],
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
