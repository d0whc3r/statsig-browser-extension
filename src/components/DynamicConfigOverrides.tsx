import { Skeleton } from '@/src/components/ui/skeleton'
import {
  useDynamicConfigOverrides,
  useDynamicConfigOverrideMutations,
} from '@/src/hooks/use-dynamic-config-overrides'

import { AddDynamicConfigOverride } from './AddDynamicConfigOverride'
import { DynamicConfigOverridesList } from './DynamicConfigOverridesList'

interface DynamicConfigOverridesProps {
  configId: string
}

const EMPTY_OVERRIDES: never[] = []

export const DynamicConfigOverrides = ({ configId }: DynamicConfigOverridesProps) => {
  const { data: overrides, isLoading, error } = useDynamicConfigOverrides(configId)
  const { addOverride, deleteOverride, isAdding, isDeleting } =
    useDynamicConfigOverrideMutations(configId)

  const handleAdd = useCallback(
    (userId: string, returnValue: Record<string, unknown>) => {
      addOverride({ ids: [userId], returnValue })
    },
    [addOverride],
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-sm text-destructive py-4">
        Failed to load overrides: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AddDynamicConfigOverride isPending={isAdding} onAdd={handleAdd} />

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Active Overrides
        </h3>
        <DynamicConfigOverridesList
          overrides={overrides || EMPTY_OVERRIDES}
          isDeleting={isDeleting}
          onDelete={deleteOverride}
        />
      </div>
    </div>
  )
}
