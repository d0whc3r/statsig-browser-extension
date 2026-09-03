import { memo, useCallback, useMemo } from 'react'

import type { SortableColumnConfig } from '@/src/hooks/use-sorted-table'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { SharedOverridesTable } from '@/src/components/common/SharedOverridesTable'

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

type GateOverrideItem = OverridesListProps['allOverrides'][0]

const getGateOverrideRowId = (item: GateOverrideItem) => `${item.type}-${item.id}-${item.idType}-${item.environment}`

export const OverridesList = memo(function OverridesList({
  allOverrides,
  canEdit,
  isPending,
  onDeleteOverride,
  onSwitchToForm,
}: OverridesListProps) {
  const isCurrentUserPredicate = useCallback((item: OverridesListProps['allOverrides'][0]) => item.isCurrentUser, [])

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
    (item: GateOverrideItem, onDeleteClick: (item: GateOverrideItem, isCurrentUser: boolean) => void) => (
      <OverrideRow
        key={getGateOverrideRowId(item)}
        item={item}
        canEdit={canEdit}
        isPending={isPending}
        onDeleteOverride={onDeleteClick}
      />
    ),
    [canEdit, isPending],
  )

  const columns = useMemo((): SortableColumnConfig<GateOverrideItem>[] => {
    const next: SortableColumnConfig<GateOverrideItem>[] = [
      { accessor: (item) => item.id, header: 'ID', id: 'id' },
      { accessor: (item) => item.idType ?? 'userID', header: 'Type', id: 'idType' },
      { accessor: (item) => item.environment ?? 'All Environments', header: 'Environment', id: 'environment' },
      { accessor: (item) => item.type, header: 'Result', id: 'result' },
    ]

    if (canEdit) {
      next.push({ className: 'w-[50px]', header: '', id: 'actions' })
    }

    return next
  }, [canEdit])

  return (
    <SharedOverridesList onAddManual={onSwitchToForm} canEdit={canEdit}>
      <SharedOverridesTable
        items={allOverrides}
        columns={columns}
        getRowId={getGateOverrideRowId}
        isCurrentUserPredicate={isCurrentUserPredicate}
        onDeleteConfirm={handleDeleteConfirm}
        colSpan={canEdit ? 5 : 4}
        emptyEntityName="gate"
        renderRow={renderRow}
      />
    </SharedOverridesList>
  )
})

OverridesList.displayName = 'OverridesList'
