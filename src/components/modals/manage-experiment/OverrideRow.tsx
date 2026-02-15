import { Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { AnyOverride } from '@/src/handlers/delete-override'
import type { Override } from '@/src/hooks/use-overrides'

import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'

interface OverrideRowProps {
  override: Override
  canEdit: boolean
  isPending?: boolean
  onDelete: (override: AnyOverride) => void
}

export const OverrideRow = memo(
  ({ override, canEdit, isPending, onDelete }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      onDelete(override)
    }, [onDelete, override])

    return (
      <TableRow>
        <TableCell className="font-medium">{override.ids.join(', ')}</TableCell>
        <TableCell>{override.groupID}</TableCell>
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
