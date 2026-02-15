import { Trash2 } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { Override } from '@/src/hooks/use-overrides'

import { Button } from '@/src/components/ui/button'
import { TableCell, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'

interface OverrideRowProps {
  override: Override
  typeApiKey: string
  currentItemId?: string
  deleteMutation: (variables: { experimentId: string; override: Override }) => void
}

export const OverrideRow = memo(
  ({ override, typeApiKey, currentItemId, deleteMutation }: OverrideRowProps) => {
    const handleDelete = useCallback(() => {
      if (currentItemId) {
        deleteMutation({
          experimentId: currentItemId,
          override,
        })
      }
    }, [currentItemId, deleteMutation, override])

    return (
      <TableRow>
        <TableCell className="font-medium">{override.ids.join(', ')}</TableCell>
        <TableCell>{override.groupID}</TableCell>
        {typeApiKey === 'write-key' && (
          <TableCell>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
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
