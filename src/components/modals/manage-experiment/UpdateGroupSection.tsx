import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import type { Group } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { updateGroup } from '@/src/handlers/update-group'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useStore } from '@/src/store/use-store'

interface Props {
  changeView: () => void
  group: Group
}

export function UpdateGroupSection({ changeView, group }: Props) {
  const { currentItemId } = useStore((state) => state)
  const { data: experiment } = useExperiment(currentItemId)
  const groups = useMemo(() => experiment?.groups || [], [experiment])
  const [groupName, setGroupName] = useState(group.name)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', currentItemId] })
      changeView()
    },
  })

  const handleGroupUpdate = useCallback(() => {
    if (!currentItemId) {
      return
    }

    const updatedGroups = groups.map((groupItem) =>
      groupItem.id === group.id ? Object.assign(groupItem, { name: groupName }) : groupItem,
    )

    mutate({
      experimentId: currentItemId,
      groups: updatedGroups,
    })
  }, [currentItemId, group.id, groupName, mutate, groups])

  const handleGroupNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setGroupName(event.target.value),
    [],
  )

  return (
    <div className="flex flex-col gap-4">
      <GroupForm groupName={groupName} onGroupNameChange={handleGroupNameChange} />
      <ActionButtons isPending={isPending} onChangeView={changeView} onUpdate={handleGroupUpdate} />
    </div>
  )
}

const GroupForm = ({
  groupName,
  onGroupNameChange,
}: {
  groupName: string
  onGroupNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="grid w-full items-center gap-1.5">
    <Label htmlFor="group-name">Group Name</Label>
    <Input
      id="group-name"
      placeholder="Enter group name"
      type="text"
      value={groupName}
      onChange={onGroupNameChange}
    />
  </div>
)

const ActionButtons = ({
  isPending,
  onChangeView,
  onUpdate,
}: {
  isPending: boolean
  onChangeView: () => void
  onUpdate: () => void
}) => (
  <div className="flex justify-end gap-2">
    <Button variant="destructive" onClick={onChangeView}>
      Back
    </Button>
    <Button disabled={isPending} onClick={onUpdate}>
      {isPending ? 'Updating...' : 'Update group'}
    </Button>
  </div>
)
