import { Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'

import type { OverrideType } from './types'

interface OverrideRowProps {
  item: {
    id: string
    type: OverrideType
    environment: string | null
    idType: string | null
  }
  canEdit: boolean
  isPending: boolean
  onDeleteOverride: (
    id: string,
    type: OverrideType,
    environment: string | null,
    idType: string | null,
  ) => void
}

export const OverrideRow = memo(
  ({ item, canEdit, isPending, onDeleteOverride }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      onDeleteOverride(item.id, item.type, item.environment, item.idType)
    }, [item.id, item.type, item.environment, item.idType, onDeleteOverride])

    return (
      <TableRow>
        <TableCell className="font-mono text-xs">{item.id}</TableCell>
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
