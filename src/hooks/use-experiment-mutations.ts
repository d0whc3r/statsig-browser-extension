import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createOverride } from '@/src/handlers/create-override'
import { deleteOverride } from '@/src/handlers/delete-override'

interface UseExperimentMutationsProps {
  currentItemId?: string
  onAddSuccess?: () => void
  onDeleteSuccess?: () => void
}

export const useExperimentMutations = ({
  currentItemId,
  onAddSuccess,
  onDeleteSuccess,
}: UseExperimentMutationsProps) => {
  const queryClient = useQueryClient()

  const { mutate: addMutation, isPending: isAdding } = useMutation({
    mutationFn: createOverride,
    onSuccess: () => {
      if (currentItemId) {
        queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
      }
      onAddSuccess?.()
    },
  })

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteOverride,
    onSuccess: () => {
      if (currentItemId) {
        queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
      }
      onDeleteSuccess?.()
    },
  })

  return { addMutation, deleteMutation, isAdding, isDeleting }
}
