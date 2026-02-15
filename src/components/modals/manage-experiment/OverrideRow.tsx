import { Trash2 } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'

import type { AnyOverride } from '@/src/handlers/delete-override'
import type { Override } from '@/src/hooks/use-overrides'
import type { Group } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'

interface OverrideRowProps {
  override: Override
  canEdit: boolean
  isPending?: boolean
  onDelete: (override: AnyOverride) => void
  groups: Group[]
}

export const OverrideRow = memo(
  ({ override, canEdit, isPending, onDelete, groups }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      onDelete(override)
    }, [onDelete, override])

    const groupName = useMemo(
      () => groups.find((g) => g.id === override.groupID)?.name || override.groupID,
      [groups, override.groupID],
    )

    return (
      <TableRow>
        <TableCell className="font-medium">{override.ids.join(', ')}</TableCell>
        <TableCell>{override.environment || 'All'}</TableCell>
        <TableCell>{override.unitType || 'userID'}</TableCell>
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

OverrideRow.displayName = 'OverrideRow'
