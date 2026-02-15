import { useMutation, useQueryClient } from '@tanstack/react-query'

import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { deleteOverride } from '@/src/handlers/delete-override'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useUIStore } from '@/src/store/use-ui-store'

import { OverrideRow } from './OverrideRow'

export function OverridesTable() {
  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')
  const { currentItemId } = useUIStore((state) => state)
  const { data: overrides } = useOverrides(currentItemId)
  const queryClient = useQueryClient()

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides', currentItemId] })
    },
  })

  if (!overrides || overrides.length === 0) {
    return <GeneralEmptyState variant="override" entityName="item" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IDs</TableHead>
            <TableHead>Override</TableHead>
            {typeApiKey === 'write-key' && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {overrides.map((override, index) => (
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
  )
}
