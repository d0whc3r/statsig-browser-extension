import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { GateOverride } from '@/src/types/statsig'

import { deleteGateOverrides, updateGateOverrides } from '@/src/handlers/gate-overrides'

import type {
  AddGateOverrideParams,
  DeleteGateOverrideParams,
  OverrideType,
} from '../components/modals/manage-gate-overrides/types'

interface CreatePayloadParams {
  targetId: string
  targetType: OverrideType
  environment: string | null
  idType: string | null
}

const createPayload = ({
  targetId,
  targetType,
  environment,
  idType,
}: CreatePayloadParams): Partial<GateOverride> => {
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

interface UpdatePayloadParams {
  payload: GateOverride
  targetUserId: string
  targetType: OverrideType
  environment: string | null
  idType: string | null
}

const updateRootOverride = (
  payload: GateOverride,
  targetUserId: string,
  targetType: OverrideType,
) => {
  if (targetType === 'pass') {
    if (!payload.passingUserIDs.includes(targetUserId)) {
      payload.passingUserIDs.push(targetUserId)
    }
  } else if (!payload.failingUserIDs.includes(targetUserId)) {
    payload.failingUserIDs.push(targetUserId)
  }
}

interface UpdateEnvironmentOverrideParams {
  payload: GateOverride
  targetUserId: string
  targetType: OverrideType
  environment: string | null
  idType: string | null
}

const updateEnvironmentOverride = ({
  payload,
  targetUserId,
  targetType,
  environment,
  idType,
}: UpdateEnvironmentOverrideParams) => {
  let envGroup = payload.environmentOverrides.find(
    (group) => group.environment === environment && group.unitID === idType,
  )

  if (!envGroup) {
    envGroup = {
      environment: environment!,
      failingIDs: [],
      passingIDs: [],
      unitID: idType!,
    }
    payload.environmentOverrides.push(envGroup)
  }

  envGroup.passingIDs = envGroup.passingIDs || []
  envGroup.failingIDs = envGroup.failingIDs || []

  if (targetType === 'pass') {
    if (!envGroup.passingIDs.includes(targetUserId)) {
      envGroup.passingIDs.push(targetUserId)
    }
  } else if (!envGroup.failingIDs.includes(targetUserId)) {
    envGroup.failingIDs.push(targetUserId)
  }
}

const updatePayload = ({
  payload,
  targetUserId,
  targetType,
  environment,
  idType,
}: UpdatePayloadParams) => {
  // Root overrides only support userID
  const isRoot = !environment && (!idType || idType === 'userID')

  if (isRoot) {
    updateRootOverride(payload, targetUserId, targetType)
  } else {
    updateEnvironmentOverride({
      environment,
      idType,
      payload,
      targetType,
      targetUserId,
    })
  }
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
    ({
      userId: targetUserId,
      type: targetType,
      environment = null,
      idType = 'userID',
    }: AddGateOverrideParams) => {
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

      updatePayload({
        environment,
        idType,
        payload,
        targetType,
        targetUserId,
      })

      updateMutate({
        gateId: currentItemId,
        overrides: payload,
      })
    },
    [currentItemId, updateMutate, currentOverrides],
  )

  const handleDeleteOverride = useCallback(
    ({
      userId: idToRemove,
      type,
      environment = null,
      idType = 'userID',
    }: DeleteGateOverrideParams) => {
      if (!currentItemId) {
        return
      }

      const payload = createPayload({
        environment,
        idType,
        targetId: idToRemove,
        targetType: type,
      })

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
