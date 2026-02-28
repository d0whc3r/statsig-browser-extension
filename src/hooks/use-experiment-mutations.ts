import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  deleteExperimentOverrides,
  updateExperimentOverrides,
} from '@/src/handlers/experiment-overrides'

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

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateExperimentOverrides,
    onSuccess: () => {
      if (currentItemId) {
        queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
      }
      onAddSuccess?.()
    },
  })

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteExperimentOverrides,
    onSuccess: () => {
      if (currentItemId) {
        queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
      }
      onDeleteSuccess?.()
    },
  })

  return { deleteMutation, isPending: isUpdating || isDeleting, updateMutation }
}
