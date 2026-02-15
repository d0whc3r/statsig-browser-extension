import { Edit } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import type { Group } from '@/src/types/statsig'

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

interface Props {
  changeView: () => void
  setCurrentGroup: (group?: Group) => void
}

interface GroupRowProps {
  group: Group
  canEdit: boolean
  onEdit: (group: Group) => void
}

const GroupRow = memo(({ group, canEdit, onEdit }: GroupRowProps) => {
  const handleEdit = useCallback(() => {
    onEdit(group)
  }, [onEdit, group])

  return (
    <TableRow>
      <TableCell className="font-medium">{group.name}</TableCell>
      <TableCell>{group.size}%</TableCell>
      {canEdit && (
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit group</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit group</TooltipContent>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  )
})
GroupRow.displayName = 'GroupRow'

export const GroupsTable = memo(({ changeView, setCurrentGroup }: Props) => {
  const [typeApiKey] = useWxtStorage(apiKeyTypeStorage)
  const { currentItemId } = useUIStore((state) => state)
  const { data: experiment } = useExperiment(currentItemId)
  const groups = experiment?.groups || []

  const updateGroup = useCallback(
    (group: Group) => {
      setCurrentGroup(group)
      changeView()
    },
    [setCurrentGroup, changeView],
  )

  if (groups.length === 0) {
    return <GeneralEmptyState variant="group" entityName="experiment" />
  }

  const canEdit = typeApiKey !== 'read-key'

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            {canEdit && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} canEdit={canEdit} onEdit={updateGroup} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})
GroupsTable.displayName = 'GroupsTable'
