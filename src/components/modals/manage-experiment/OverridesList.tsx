import { memo, useCallback } from 'react'

import type { AnyOverride, ExperimentOverride, Group, UserIDOverride } from '@/src/types/statsig'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { SharedOverridesTable } from '@/src/components/common/SharedOverridesTable'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

interface UserOverridesTableProps {
  canEdit: boolean
  isPending: boolean
  overrides: (UserIDOverride & { isCurrentUser?: boolean })[]
  groups: Group[]
  onDelete: (override: AnyOverride) => void
}

const UserOverridesTable = memo(({ canEdit, isPending, overrides, groups, onDelete }: UserOverridesTableProps) => {
  const isCurrentUserPredicate = useCallback(
    (item: UserIDOverride & { isCurrentUser?: boolean }) => Boolean(item.isCurrentUser),
    [],
  )

  const renderRow = useCallback(
    (
      override: UserIDOverride & { isCurrentUser?: boolean },
      onDeleteClick: (item: UserIDOverride & { isCurrentUser?: boolean }, isCurrentUser: boolean) => void,
    ) => (
      <OverrideRow
        key={`${override.groupID}-${override.ids?.join(',')}`}
        override={override}
        canEdit={canEdit}
        isPending={isPending}
        onDelete={onDeleteClick}
        groups={groups}
      />
    ),
    [canEdit, isPending, groups],
  )

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">User Overrides</h4>
      <SharedOverridesTable
        items={overrides}
        isCurrentUserPredicate={isCurrentUserPredicate}
        onDeleteConfirm={onDelete}
        colSpan={canEdit ? 5 : 4}
        emptyEntityName="item"
        headers={
          <>
            <TableHead>IDs</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>ID Type</TableHead>
            <TableHead>Group</TableHead>
            {canEdit && <TableHead className="w-[50px]" />}
          </>
        }
        renderRow={renderRow}
      />
    </div>
  )
})

UserOverridesTable.displayName = 'UserOverridesTable'

interface GateOverridesTableProps {
  canEdit: boolean
  isPending: boolean
  overrides: ExperimentOverride[]
  groups: Group[]
  onDelete: (override: AnyOverride) => void
}

const GateOverridesTable = memo(({ canEdit, isPending, overrides, groups, onDelete }: GateOverridesTableProps) => (
  <div className="mt-8 space-y-3">
    <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Gate/Segment Overrides</h4>
    <div className="overflow-hidden rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Group</TableHead>
            {canEdit && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {overrides && overrides.length > 0 ? (
            overrides.map((override) => (
              <ExperimentOverrideRow
                key={`${override.type}-${override.name}-${override.groupID}`}
                override={override}
                canEdit={canEdit}
                isPending={isPending}
                onDelete={onDelete}
                groups={groups}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={canEdit ? 4 : 3} className="h-24 text-center">
                <div className="flex justify-center">
                  <GeneralEmptyState variant="override" entityName="item" />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
))

GateOverridesTable.displayName = 'GateOverridesTable'

interface OverridesListProps {
  canEdit: boolean
  onCreateOverrideClick: () => void
  onDeleteOverride: (override: AnyOverride) => void
  isPending: boolean
  overridesData:
    | {
        userIDOverrides: (UserIDOverride & { isCurrentUser?: boolean })[]
        overrides: ExperimentOverride[]
      }
    | undefined
  groups: Group[]
}

const EMPTY_USERS: (UserIDOverride & { isCurrentUser?: boolean })[] = []
const EMPTY_EXPERIMENTS: ExperimentOverride[] = []

export const OverridesList = memo(
  ({ canEdit, onCreateOverrideClick, onDeleteOverride, isPending, overridesData, groups }: OverridesListProps) => {
    const userOverrides = overridesData?.userIDOverrides ?? EMPTY_USERS
    const gateOverrides = overridesData?.overrides ?? EMPTY_EXPERIMENTS

    return (
      <SharedOverridesList onAddManual={onCreateOverrideClick} canEdit={canEdit}>
        <div className="flex flex-col gap-6">
          <UserOverridesTable
            canEdit={canEdit}
            isPending={isPending}
            overrides={userOverrides}
            groups={groups}
            onDelete={onDeleteOverride}
          />

          <GateOverridesTable
            canEdit={canEdit}
            isPending={isPending}
            overrides={gateOverrides}
            groups={groups}
            onDelete={onDeleteOverride}
          />
        </div>
      </SharedOverridesList>
    )
  },
)

OverridesList.displayName = 'OverridesList'
