import { useMutation, useQueryClient } from '@tanstack/react-query'

import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { deleteOverride } from '@/src/handlers/delete-override'

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

interface OverridesTableProps {
  overridesData:
    | {
        userIDOverrides: any[]
        overrides: any[]
      }
    | undefined
  currentItemId: string | undefined
  typeApiKey: string
}

export function OverridesTable({ overridesData, currentItemId, typeApiKey }: OverridesTableProps) {
  const queryClient = useQueryClient()

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
    },
  })

  if (
    !overridesData ||
    (overridesData.userIDOverrides.length === 0 && overridesData.overrides.length === 0)
  ) {
    return (
      <div className="rounded-md border p-8 text-center">
        <GeneralEmptyState variant="override" entityName="item" />
      </div>
    )
  }

  return (
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
                  {typeApiKey === 'write-key' && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {overridesData.userIDOverrides.map((override, index) => (
                  <OverrideRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${override.groupID}-${override.ids?.join(',') || index}`}
                    override={override}
                    typeApiKey={typeApiKey}
                    currentItemId={currentItemId}
                    deleteMutation={deleteMutation}
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
                  {typeApiKey === 'write-key' && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {overridesData.overrides.map((override) => (
                  <ExperimentOverrideRow
                    key={`${override.type}-${override.name}-${override.groupID}`}
                    override={override}
                    typeApiKey={typeApiKey}
                    currentItemId={currentItemId}
                    deleteMutation={deleteMutation}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
