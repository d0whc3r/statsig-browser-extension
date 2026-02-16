import { Trash2 } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'

import type { AnyOverride } from '@/src/handlers/delete-override'
import type { ExperimentOverride, Group } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'

interface ExperimentOverrideRowProps {
  override: ExperimentOverride
  canEdit: boolean
  isPending?: boolean
  onDelete: (override: AnyOverride) => void
  groups: Group[]
}

export const ExperimentOverrideRow = memo(
  ({ override, canEdit, isPending, onDelete, groups }: ExperimentOverrideRowProps) => {
    const handleDelete = useCallback(() => {
      onDelete(override)
    }, [onDelete, override])

    const groupName = useMemo(
      () => groups.find((group) => group.id === override.groupID)?.name || override.groupID,
      [groups, override.groupID],
    )

    return (
      <TableRow>
        <TableCell className="font-medium capitalize">{override.type}</TableCell>
        <TableCell>{override.name}</TableCell>
        <TableCell>{groupName}</TableCell>
        {canEdit && (
          <TableCell>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete override</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete override</TooltipContent>
            </Tooltip>
          </TableCell>
        )}
      </TableRow>
    )
  },
)

ExperimentOverrideRow.displayName = 'ExperimentOverrideRow'
