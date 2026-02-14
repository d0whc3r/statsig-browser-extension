import { Plus } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'

import type { OverrideType } from './types'

import { OverrideRow } from './OverrideRow'

interface OverridesListProps {
  allOverrides: { id: string; type: OverrideType }[]
  canEdit: boolean
  isPending: boolean
  onDeleteOverride: (id: string, type: OverrideType) => void
  onSwitchToForm: () => void
}

export const OverridesList = memo(
  ({ allOverrides, canEdit, isPending, onDeleteOverride, onSwitchToForm }: OverridesListProps) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Active Overrides</h3>
        {canEdit && (
          <Button size="sm" onClick={onSwitchToForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manual
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Result</TableHead>
              {canEdit && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOverrides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No overrides found
                </TableCell>
              </TableRow>
            ) : (
              allOverrides.map((item) => (
                <OverrideRow
                  key={`${item.type}-${item.id}`}
                  item={item}
                  canEdit={canEdit}
                  isPending={isPending}
                  onDeleteOverride={onDeleteOverride}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
)

OverridesList.displayName = 'OverridesList'
