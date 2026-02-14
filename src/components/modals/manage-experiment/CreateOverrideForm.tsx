import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

interface CreateOverrideFormProps {
  groups: { name: string }[]
  selectedGroup: string
  onSelectedGroupChange: (value: string) => void
  overrideId: string
  onOverrideIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBackClick: () => void
  onAddOverride: () => void
  isPending: boolean
}

export const CreateOverrideForm = ({
  groups,
  selectedGroup,
  onSelectedGroupChange,
  overrideId,
  onOverrideIdChange,
  onBackClick,
  onAddOverride,
  isPending,
}: CreateOverrideFormProps) => (
  <div className="flex flex-col gap-4">
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="group-select">Select a group</Label>
      <Select onValueChange={onSelectedGroupChange} value={selectedGroup}>
        <SelectTrigger id="group-select">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.name} value={group.name}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="override-id">Override ID</Label>
      <Input
        id="override-id"
        placeholder="Enter a override ID"
        type="text"
        value={overrideId}
        onChange={onOverrideIdChange}
      />
    </div>

    <div className="flex justify-end gap-2">
      <Button variant="destructive" onClick={onBackClick}>
        Back
      </Button>
      <Button disabled={isPending || !selectedGroup || !overrideId} onClick={onAddOverride}>
        {isPending ? 'Adding...' : 'Add override'}
      </Button>
    </div>
  </div>
)
