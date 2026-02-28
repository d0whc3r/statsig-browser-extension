import { ChevronDown, ChevronUp } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'

import type { AnyOverride, ExperimentOverride, Group, UserIDOverride } from '@/src/types/statsig'

import { ConfirmDialog } from '@/src/components/common/ConfirmDialog'
import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

interface UserOverridesTableProps {
  canEdit: boolean
  isPending: boolean
  overrides: (UserIDOverride & { isCurrentUser?: boolean })[]
  groups: Group[]
  onDelete: (override: AnyOverride) => void
}

const UserOverridesTable = memo(
  ({ canEdit, isPending, overrides, groups, onDelete }: UserOverridesTableProps) => {
    const [showOthers, setShowOthers] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState<AnyOverride | null>(null)

    const toggleOthers = useCallback(() => setShowOthers((prev) => !prev), [])

    const { currentUserOverrides, otherOverrides } = useMemo(() => {
      const current = overrides.filter((overrideItem) => overrideItem.isCurrentUser)
      const others = overrides.filter((overrideItem) => !overrideItem.isCurrentUser)
      return { currentUserOverrides: current, otherOverrides: others }
    }, [overrides])

    const handleDeleteClick = useCallback(
      (override: AnyOverride) => {
        // Check if it's a UserIDOverride with isCurrentUser
        const isCurrentUser =
          'isCurrentUser' in override && (override as { isCurrentUser?: boolean }).isCurrentUser
        if (isCurrentUser) {
          onDelete(override)
        } else {
          setConfirmDelete(override)
        }
      },
      [onDelete],
    )

    const handleConfirmDelete = useCallback(() => {
      if (confirmDelete) {
        onDelete(confirmDelete)
        setConfirmDelete(null)
      }
    }, [confirmDelete, onDelete])

    const handleCloseConfirm = useCallback(() => setConfirmDelete(null), [])

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">User Overrides</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IDs</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>ID Type</TableHead>
                <TableHead>Group</TableHead>
                {canEdit && <TableHead className="w-[50px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUserOverrides.length > 0 || otherOverrides.length > 0 ? (
                <>
                  {currentUserOverrides.map((override, index) => (
                    <OverrideRow
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${override.groupID}-${override.ids?.join(',') || index}`}
                      override={override}
                      canEdit={canEdit}
                      isPending={isPending}
                      onDelete={handleDeleteClick}
                      groups={groups}
                    />
                  ))}
                  {showOthers &&
                    otherOverrides.map((override, index) => (
                      <OverrideRow
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${override.groupID}-${override.ids?.join(',') || index}`}
                        override={override}
                        canEdit={canEdit}
                        isPending={isPending}
                        onDelete={handleDeleteClick}
                        groups={groups}
                      />
                    ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">
                    <div className="flex justify-center">
                      <GeneralEmptyState variant="override" entityName="item" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {otherOverrides.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={toggleOthers}
            >
              {showOthers ? (
                <>
                  <ChevronUp className="mr-2 h-3 w-3" />
                  Hide {otherOverrides.length} other overrides
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-3 w-3" />
                  Show {otherOverrides.length} other overrides
                </>
              )}
            </Button>
          </div>
        )}

        <ConfirmDialog
          isOpen={Boolean(confirmDelete)}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmDelete}
          title="Delete Override"
          description="This override is for another user. Are you sure you want to delete it?"
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    )
  },
)

UserOverridesTable.displayName = 'UserOverridesTable'

interface GateOverridesTableProps {
  canEdit: boolean
  isPending: boolean
  overrides: ExperimentOverride[]
  groups: Group[]
  onDelete: (override: AnyOverride) => void
}

const GateOverridesTable = memo(
  ({ canEdit, isPending, overrides, groups, onDelete }: GateOverridesTableProps) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Gate/Segment Overrides</h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
  ),
)

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
  ({
    canEdit,
    onCreateOverrideClick,
    onDeleteOverride,
    isPending,
    overridesData,
    groups,
  }: OverridesListProps) => {
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
