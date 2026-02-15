import { memo } from 'react'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
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
    <SharedOverridesList onAddManual={onSwitchToForm} canEdit={canEdit}>
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
                <TableCell colSpan={3} className="h-24 text-center">
                  <GeneralEmptyState variant="override" entityName="gate" />
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
    </SharedOverridesList>
  ),
)

OverridesList.displayName = 'OverridesList'
