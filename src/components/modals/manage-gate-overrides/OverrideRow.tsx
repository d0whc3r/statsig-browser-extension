import { Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'

import type { DeleteGateOverrideParams, OverrideType } from './types'

interface OverrideRowProps {
  item: {
    id: string
    type: OverrideType
    environment: string | null
    idType: string | null
    isCurrentUser: boolean
  }
  canEdit: boolean
  isPending: boolean
  onDeleteOverride: (params: DeleteGateOverrideParams) => void
}

export const OverrideRow = memo(
  ({ item, canEdit, isPending, onDeleteOverride }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      const isOtherUser = !item.isCurrentUser
      const confirmDialog = globalThis.confirm || window.confirm
      if (
        isOtherUser &&
        confirmDialog &&
        !confirmDialog('This override is for another user. Are you sure you want to delete it?')
      ) {
        return
      }

      onDeleteOverride({
        environment: item.environment,
        idType: item.idType,
        type: item.type,
        userId: item.id,
      })
    }, [item, onDeleteOverride])

    return (
      <TableRow className={item.isCurrentUser ? 'bg-muted/30' : undefined}>
        <TableCell className="font-mono text-xs">
          <div className="flex items-center gap-2">
            {item.id}
            {item.isCurrentUser && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] uppercase">
                You
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{item.idType || 'userID'}</TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {item.environment || 'All Environments'}
        </TableCell>
        <TableCell>
          <Badge variant={item.type === 'pass' ? 'default' : 'destructive'}>
            {item.type.toUpperCase()}
          </Badge>
        </TableCell>
        {canEdit && (
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        )}
      </TableRow>
    )
  },
)

OverrideRow.displayName = 'OverrideRow'
