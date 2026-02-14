import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addDynamicConfigOverride,
  deleteDynamicConfigOverride,
  fetchDynamicConfigOverrides,
} from '@/src/handlers/dynamic-config-overrides'

export const useDynamicConfigOverrides = (configId?: string) =>
  useQuery({
    enabled: Boolean(configId),
    queryFn: () => fetchDynamicConfigOverrides(configId!),
    queryKey: ['dynamic-config-overrides', configId],
  })

export const useDynamicConfigOverrideMutations = (configId: string) => {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (override: { ids: string[]; returnValue: Record<string, unknown> }) =>
      addDynamicConfigOverride(configId, override),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-config-overrides', configId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (override: { ids: string[]; returnValue: Record<string, unknown> }) =>
      deleteDynamicConfigOverride(configId, override),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-config-overrides', configId] })
    },
  })

  return {
    addOverride: addMutation.mutate,
    deleteOverride: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
