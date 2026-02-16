import { memo, useCallback, useMemo, useState } from 'react'

import type { AddOverrideParams } from '@/src/components/common/GenericAddOverrideForm'
import type { AnyOverride } from '@/src/handlers/create-override'
import type { Experiment, Group } from '@/src/types/statsig'

import { GenericAddOverrideForm } from '@/src/components/common/GenericAddOverrideForm'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'

interface GateSegmentOverrideFormProps {
  groups: Group[]
  onAddOverride: (override: AnyOverride) => void
  onCancel: () => void
  isPending: boolean
}

const GateSegmentOverrideForm = memo(
  ({ groups, onAddOverride, onCancel, isPending }: GateSegmentOverrideFormProps) => {
    const [overrideType, setOverrideType] = useState<'gate' | 'segment'>('gate')
    const [gateName, setGateName] = useState('')
    const [targetGroup, setTargetGroup] = useState<string>(groups[0]?.name || '')

    const handleGateNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setGateName(event.target.value)
    }, [])

    const handleOverrideTypeChange = useCallback(
      (val: 'gate' | 'segment') => setOverrideType(val),
      [],
    )

    const handleAddGateOverride = useCallback(() => {
      onAddOverride({
        groupID: targetGroup,
        name: gateName,
        type: overrideType,
      })
    }, [onAddOverride, targetGroup, gateName, overrideType])

    return (
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="override-type">Override Type</Label>
            <Select value={overrideType} onValueChange={handleOverrideTypeChange}>
              <SelectTrigger id="override-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gate">Gate</SelectItem>
                <SelectItem value="segment">Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="gate-name">Name</Label>
            <Input
              id="gate-name"
              placeholder={`Enter ${overrideType} name`}
              value={gateName}
              onChange={handleGateNameChange}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="target-group">Target Group</Label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger id="target-group">
                <SelectValue placeholder="Select group" />
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

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              disabled={isPending || !gateName || !targetGroup}
              onClick={handleAddGateOverride}
            >
              Add Override
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  },
)

GateSegmentOverrideForm.displayName = 'GateSegmentOverrideForm'

interface CreateOverrideFormProps {
  groups: Group[]
  onAddOverride: (override: AnyOverride) => void
  onCancel: () => void
  isPending: boolean
  experiment?: Experiment
}

export const AddOverrideForm = memo(
  ({ groups, onAddOverride, onCancel, isPending, experiment }: CreateOverrideFormProps) => {
    const [selectedGroup, setSelectedGroup] = useState<string>(groups[0]?.name || '')

    const groupValues = useMemo(
      () => groups.map((group) => ({ label: group.name, value: group.name })),
      [groups],
    )

    const handleAddUserOverride = useCallback(
      ({ id, value: groupID, environment, idType }: AddOverrideParams<string>) => {
        onAddOverride({
          environment: environment || undefined,
          groupID,
          ids: [id],
          unitType: idType || undefined,
        })
      },
      [onAddOverride],
    )

    const getSubmitButtonClassName = useCallback(() => 'bg-primary', [])
    const getSubmitButtonText = useCallback((val: string) => `Add Override to ${val}`, [])

    return (
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">User Override</TabsTrigger>
          <TabsTrigger value="gate_segment">Gate/Segment Override</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <GenericAddOverrideForm
            isPending={isPending}
            onAddOverride={handleAddUserOverride}
            onCancel={onCancel}
            valueLabel="Group"
            values={groupValues}
            selectedValue={selectedGroup}
            onValueChange={setSelectedGroup}
            defaultIdType={experiment?.idType || 'userID'}
            getSubmitButtonClassName={getSubmitButtonClassName}
            getSubmitButtonText={getSubmitButtonText}
          />
        </TabsContent>
        <TabsContent value="gate_segment">
          <GateSegmentOverrideForm
            groups={groups}
            onAddOverride={onAddOverride}
            onCancel={onCancel}
            isPending={isPending}
          />
        </TabsContent>
      </Tabs>
    )
  },
)

AddOverrideForm.displayName = 'AddOverrideForm'
