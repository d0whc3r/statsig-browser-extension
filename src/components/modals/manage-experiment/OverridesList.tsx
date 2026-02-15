import type { AnyOverride } from '@/src/handlers/delete-override'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

interface OverridesListProps {
  canEdit: boolean
  onCreateOverrideClick: () => void
  onDeleteOverride: (override: AnyOverride) => void
  isPending: boolean
  overridesData:
    | {
        userIDOverrides: any[]
        overrides: any[]
      }
    | undefined
}

export const OverridesList = ({
  canEdit,
  onCreateOverrideClick,
  onDeleteOverride,
  isPending,
  overridesData,
}: OverridesListProps) => {
  return (
    <SharedOverridesList onAddManual={onCreateOverrideClick} canEdit={canEdit}>
      {!overridesData ||
      (overridesData.userIDOverrides.length === 0 && overridesData.overrides.length === 0) ? (
        <div className="rounded-md border p-8 text-center">
          <GeneralEmptyState variant="override" entityName="item" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {overridesData.userIDOverrides.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">User Overrides</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IDs</TableHead>
                      <TableHead>Group</TableHead>
                      {canEdit && <TableHead className="w-[50px]" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overridesData.userIDOverrides.map((override, index) => (
                      <OverrideRow
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${override.groupID}-${override.ids?.join(',') || index}`}
                        override={override}
                        canEdit={canEdit}
                        isPending={isPending}
                        onDelete={onDeleteOverride}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {overridesData.overrides.length > 0 && (
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
                    {overridesData.overrides.map((override) => (
                      <ExperimentOverrideRow
                        key={`${override.type}-${override.name}-${override.groupID}`}
                        override={override}
                        canEdit={canEdit}
                        isPending={isPending}
                        onDelete={onDeleteOverride}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </SharedOverridesList>
  )
}
