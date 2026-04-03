import { memo, useCallback } from 'react'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { SharedOverridesTable } from '@/src/components/common/SharedOverridesTable'
import { TableHead } from '@/src/components/ui/table'

import type { DeleteGateOverrideParams, OverrideType } from './types'

import { OverrideRow } from './OverrideRow'

interface OverridesListProps {
  allOverrides: {
    id: string
    type: OverrideType
    environment: string | null
    idType: string | null
    isCurrentUser: boolean
  }[]
  canEdit: boolean
  isPending: boolean
  onDeleteOverride: (params: DeleteGateOverrideParams) => void
  onSwitchToForm: () => void
}

export const OverridesList = memo(
  ({ allOverrides, canEdit, isPending, onDeleteOverride, onSwitchToForm }: OverridesListProps) => {
    const isCurrentUserPredicate = useCallback(
      (item: OverridesListProps['allOverrides'][0]) => item.isCurrentUser,
      [],
    )

    const handleDeleteConfirm = useCallback(
      (item: OverridesListProps['allOverrides'][0]) => {
        onDeleteOverride({
          environment: item.environment,
          idType: item.idType,
          type: item.type,
          userId: item.id,
        })
      },
      [onDeleteOverride],
    )

    const renderRow = useCallback(
      (
        item: OverridesListProps['allOverrides'][0],
        onDeleteClick: (
          item: OverridesListProps['allOverrides'][0],
          isCurrentUser: boolean,
        ) => void,
      ) => (
        <OverrideRow
          key={`${item.type}-${item.id}-${item.idType}-${item.environment}`}
          item={item}
          canEdit={canEdit}
          isPending={isPending}
          onDeleteOverride={onDeleteClick}
        />
      ),
      [canEdit, isPending],
    )

    return (
      <SharedOverridesList onAddManual={onSwitchToForm} canEdit={canEdit}>
        <SharedOverridesTable
          items={allOverrides}
          isCurrentUserPredicate={isCurrentUserPredicate}
          onDeleteConfirm={handleDeleteConfirm}
          colSpan={canEdit ? 5 : 4}
          emptyEntityName="gate"
          headers={
            <>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Result</TableHead>
              {canEdit && <TableHead className="w-[50px]" />}
            </>
          }
          renderRow={renderRow}
        />
      </SharedOverridesList>
    )
  },
)

OverridesList.displayName = 'OverridesList'
