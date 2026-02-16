import type { AnyOverride } from '@/src/handlers/delete-override'
import type { Override } from '@/src/hooks/use-overrides'
import type { ExperimentOverride, Group } from '@/src/types/statsig'

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

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

interface OverridesListProps {
  canEdit: boolean
  onCreateOverrideClick: () => void
  onDeleteOverride: (override: AnyOverride) => void
  isPending: boolean
  overridesData:
    | {
        userIDOverrides: Override[]
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
}: OverridesListProps) => (
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
              {overridesData?.userIDOverrides.length ? (
                overridesData.userIDOverrides.map((override, index) => (
                  <OverrideRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${override.groupID}-${override.ids?.join(',') || index}`}
                    override={override}
                    canEdit={canEdit}
                    isPending={isPending}
                    onDelete={onDeleteOverride}
                    groups={groups}
                  />
                ))
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
  </SharedOverridesList>
)
