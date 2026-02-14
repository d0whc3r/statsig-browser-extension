import { Trash2 } from 'lucide-react'
import { useCallback } from 'react'

import type { DynamicConfigOverride } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'

interface DynamicConfigOverridesListProps {
  overrides: DynamicConfigOverride[]
  isDeleting: boolean
  onDelete: (override: { ids: string[]; returnValue: Record<string, unknown> }) => void
}

export const DynamicConfigOverridesList = ({
  overrides,
  isDeleting,
  onDelete,
}: DynamicConfigOverridesListProps) => {
  const handleDelete = useCallback(
    (override: DynamicConfigOverride) => {
      onDelete({ ids: override.ids, returnValue: override.returnValue })
    },
    [onDelete],
  )

  if (overrides.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">No overrides configured.</div>
    )
  }

  return (
    <div className="space-y-4">
      {overrides.map((override, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap gap-1">
                {override.ids.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {id}
                  </span>
                ))}
              </div>
              <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(override.returnValue, undefined, 2)}
              </pre>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
              onClick={() => handleDelete(override)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete override</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
