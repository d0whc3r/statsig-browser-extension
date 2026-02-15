import { Loader2, Plus } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import type { Group } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

interface AddOverrideInputProps {
  newId: string
  setNewId: (value: string) => void
  selectedGroupId: string
  setSelectedGroupId: (value: string) => void
  groups: Group[]
  isPending: boolean
  onAdd: () => void
}

export const AddOverrideInput = memo(
  ({
    newId,
    setNewId,
    selectedGroupId,
    setSelectedGroupId,
    groups,
    isPending,
    onAdd,
  }: AddOverrideInputProps) => {
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewId(event.target.value)
      },
      [setNewId],
    )

    return (
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium">Manual Override</h4>
        <div className="flex gap-2">
          <Input
            placeholder="User ID"
            value={newId}
            onChange={handleChange}
            className="h-8 flex-1"
          />
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8"
            disabled={!newId || !selectedGroupId || isPending}
            onClick={onAdd}
            aria-label="Add Override"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  },
)
AddOverrideInput.displayName = 'AddOverrideInput'
