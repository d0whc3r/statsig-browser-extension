import { useMutation, useQueryClient } from '@tanstack/react-query'

import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { deleteOverride } from '@/src/handlers/delete-override'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useOverrides } from '@/src/hooks/use-overrides'
import { STORAGE_KEYS } from '@/src/lib/storage-keys'
import { useUIStore } from '@/src/store/use-ui-store'

import { ExperimentOverrideRow } from './ExperimentOverrideRow'
import { OverrideRow } from './OverrideRow'

export function OverridesTable() {
  const [typeApiKey] = useLocalStorage(STORAGE_KEYS.API_KEY_TYPE, 'write-key')
  const { currentItemId } = useUIStore((state) => state)
  const { data: overridesData } = useOverrides(currentItemId)
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
    return <GeneralEmptyState variant="override" entityName="item" />
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
