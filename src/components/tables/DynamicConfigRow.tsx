import React, { memo, useCallback } from 'react'

import type { DynamicConfig } from '@/src/types/statsig'

import { ActionsCell, NameCell, TagsCell } from '@/src/components/tables/CommonCells'
import { Badge } from '@/src/components/ui/badge'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface DynamicConfigRowProps {
  item: DynamicConfig
  headerColumns: readonly { uid: string }[]
  onRowClick: (id: string) => void
}

interface DynamicConfigCellProps {
  config: DynamicConfig
  columnKey: string
  onRowClick: (id: string) => void
  showInlineId: boolean
}

const DynamicConfigCell = memo(({ config, columnKey, onRowClick, showInlineId }: DynamicConfigCellProps) => {
  switch (columnKey) {
    case 'name': {
      return <NameCell id={config.id} name={config.name} showInlineId={showInlineId} />
    }
    case 'isEnabled': {
      return (
        <Badge variant={config.isEnabled ? 'default' : 'destructive'} className="capitalize">
          {config.isEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    }
    case 'tags': {
      return <TagsCell tags={config.tags} />
    }
    case 'actions': {
      return (
        <ActionsCell
          id={config.id}
          onRowClick={onRowClick}
          statsigUrl={`https://console.statsig.com/dynamic_configs/${config.id}`}
        />
      )
    }
    default: {
      return null
    }
  }
})

DynamicConfigCell.displayName = 'DynamicConfigCell'

export const DynamicConfigRow = memo(({ item, headerColumns, onRowClick }: DynamicConfigRowProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
      {headerColumns.map((column) => (
        <TableCell key={column.uid} className={column.uid === 'actions' ? 'text-right' : ''}>
          <DynamicConfigCell config={item} columnKey={column.uid} onRowClick={onRowClick} showInlineId />
        </TableCell>
      ))}
    </TableRow>
  )
})

DynamicConfigRow.displayName = 'DynamicConfigRow'
