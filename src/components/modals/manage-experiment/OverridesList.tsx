import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

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

export const OverridesList = ({
  canEdit,
  onCreateOverrideClick,
  onDeleteOverride,
  isPending,
  overridesData,
  groups,
}: OverridesListProps) => {
  const [showOthers, setShowOthers] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AnyOverride | null>(null)

  const handleDeleteClick = useCallback(
    (override: AnyOverride) => {
      // Check if it's a UserIDOverride with isCurrentUser
      const { isCurrentUser } = override as any
      if (isCurrentUser) {
        onDeleteOverride(override)
      } else {
        setConfirmDelete(override)
      }
    },
    [onDeleteOverride],
  )

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      onDeleteOverride(confirmDelete)
      setConfirmDelete(null)
    }
  }, [confirmDelete, onDeleteOverride])

  const toggleOthers = useCallback(() => {
    setShowOthers((prev) => !prev)
  }, [])

  const { currentUserOverrides, otherOverrides } = useMemo(() => {
    const userIDOverrides = overridesData?.userIDOverrides || []
    const current = userIDOverrides.filter((override) => override.isCurrentUser)
    const others = userIDOverrides.filter((override) => !override.isCurrentUser)
    return { currentUserOverrides: current, otherOverrides: others }
  }, [overridesData?.userIDOverrides])

  return (
    <SharedOverridesList onAddManual={onCreateOverrideClick} canEdit={canEdit}>
      <div className="flex flex-col gap-6">
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
        </div>

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
                {overridesData?.overrides && overridesData.overrides.length > 0 ? (
                  overridesData.overrides.map((override) => (
                    <ExperimentOverrideRow
                      key={`${override.type}-${override.name}-${override.groupID}`}
                      override={override}
                      canEdit={canEdit}
                      isPending={isPending}
                      onDelete={onDeleteOverride}
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
      </div>
      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Override"
        description="This override is for another user. Are you sure you want to delete it?"
        confirmText="Delete"
        variant="destructive"
      />
    </SharedOverridesList>
  )
}
