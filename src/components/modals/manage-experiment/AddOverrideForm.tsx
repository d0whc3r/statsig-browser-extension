import type { OverrideType } from '@/src/hooks/use-overrides-section-logic'
import type { FeatureGate } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
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
  overrideValue: string
  onOverrideValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  setOverrideValue: (value: string) => void
  onAddOverride: () => void
  onCancel: () => void
  isPending: boolean
  overrideType: OverrideType
  onOverrideTypeChange: (value: OverrideType) => void
  featureGates: FeatureGate[]
}

export const AddOverrideForm = ({
  groups,
  selectedGroup,
  onSelectedGroupChange,
  overrideValue,
  onOverrideValueChange,
  setOverrideValue,
  onAddOverride,
  onCancel,
  isPending,
  overrideType,
  onOverrideTypeChange,
  featureGates,
}: CreateOverrideFormProps) => (
  <Card>
    <CardContent className="space-y-4 pt-6">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="type-select">Override Type</Label>
        <Select
          onValueChange={(val) => onOverrideTypeChange(val as OverrideType)}
          value={overrideType}
        >
          <SelectTrigger id="type-select">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="gate">Gate</SelectItem>
            <SelectItem value="segment">Segment</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {overrideType === 'gate' ? (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="gate-select">Select a Gate</Label>
          <Select onValueChange={setOverrideValue} value={overrideValue}>
            <SelectTrigger id="gate-select">
              <SelectValue placeholder="Select a gate" />
            </SelectTrigger>
            <SelectContent>
              {featureGates.map((gate) => (
                <SelectItem key={gate.id} value={gate.id}>
                  <span className="flex items-center gap-2">
                    <span>{gate.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({gate.isEnabled ? 'Enabled' : 'Disabled'})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="override-id">
            {overrideType === 'segment' ? 'Segment Name' : 'User ID'}
          </Label>
          <Input
            id="override-id"
            placeholder={overrideType === 'segment' ? 'Enter segment name' : 'Enter user ID'}
            type="text"
            value={overrideValue}
            onChange={onOverrideValueChange}
          />
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={isPending || !selectedGroup || !overrideValue} onClick={onAddOverride}>
          {isPending ? 'Adding...' : 'Add override'}
        </Button>
      </div>
    </CardContent>
  </Card>
)
