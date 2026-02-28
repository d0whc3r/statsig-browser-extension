import { Trash2 } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'

import type { AnyOverride, Group, UserIDOverride } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'

interface OverrideRowProps {
  override: UserIDOverride & { isCurrentUser?: boolean }
  canEdit: boolean
  isPending?: boolean
  onDelete: (override: AnyOverride) => void
  groups: Group[]
}

export const OverrideRow = memo(
  ({ override, canEdit, isPending, onDelete, groups }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      const isOtherUser = !override.isCurrentUser
      const confirmDialog = globalThis.confirm
      if (
        isOtherUser &&
        confirmDialog &&
        !confirmDialog('This override is for another user. Are you sure you want to delete it?')
      ) {
        return
      }

      onDelete(override)
    }, [onDelete, override])

    const groupName = useMemo(
      () => groups.find((group) => group.id === override.groupID)?.name || override.groupID,
      [groups, override.groupID],
    )

    return (
      <TableRow className={override.isCurrentUser ? 'bg-muted/30' : undefined}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {override.ids.join(', ')}
            {override.isCurrentUser && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] uppercase">
                You
              </Badge>
            )}
          </div>
        </TableCell>
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
