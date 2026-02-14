import { ExternalLink, Eye, MoreVertical } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import type { dynamicConfigColumns } from '@/src/components/tables/data'
import type { DynamicConfig } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface DynamicConfigRowProps {
  item: DynamicConfig
  headerColumns: typeof dynamicConfigColumns
  onRowClick: (id: string) => void
}

export const DynamicConfigRow = memo(
  ({ item, headerColumns, onRowClick }: DynamicConfigRowProps) => {
    const handleRowClick = useCallback(() => {
      onRowClick(item.id)
    }, [onRowClick, item.id])

    const handleOpenStatsig = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()
      },
      [], // External link handling
    )

    const renderCell = useCallback(
      (config: DynamicConfig, columnKey: string) => {
        const cellValue = config[columnKey as keyof DynamicConfig]

        switch (columnKey) {
          case 'name': {
            return <div className="cursor-pointer font-medium hover:underline">{config.name}</div>
          }
          case 'isEnabled': {
            return (
              <Badge variant={config.isEnabled ? 'default' : 'destructive'} className="capitalize">
                {config.isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )
          }
          case 'tags': {
            const tags = cellValue as string[]
            return (
              <div className="flex flex-wrap gap-1">
                {tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )
          }
          case 'actions': {
            return (
              <div className="relative flex justify-end items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRowClick}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://console.statsig.com/dynamic_configs/${config.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                        onClick={handleOpenStatsig}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open on Statsig
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }
          default: {
            return <div>{String(cellValue)}</div>
          }
        }
      },
      [handleRowClick, handleOpenStatsig],
    )

    return (
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
        {headerColumns.map((column) => (
          <TableCell key={column.uid} className={column.uid === 'actions' ? 'text-right' : ''}>
            {renderCell(item, column.uid)}
          </TableCell>
        ))}
      </TableRow>
    )
  },
)

DynamicConfigRow.displayName = 'DynamicConfigRow'
