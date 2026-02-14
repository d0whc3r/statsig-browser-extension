import { Loader2 } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

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

import type { OverrideType } from './types'

interface AddOverrideFormProps {
  isPending: boolean
  onAddOverride: (userId: string, type: OverrideType) => void
  onCancel: () => void
}

export const AddOverrideForm = memo(
  ({ isPending, onAddOverride, onCancel }: AddOverrideFormProps) => {
    const [overrideType, setOverrideType] = useState<OverrideType>('pass')
    const [userId, setUserId] = useState('')

    const handleAdd = useCallback(() => {
      onAddOverride(userId, overrideType)
    }, [userId, overrideType, onAddOverride])

    const handleTypeChange = useCallback((val: string) => {
      setOverrideType(val as OverrideType)
    }, [])

    const handleUserIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setUserId(event.target.value)
    }, [])

    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="override-type">Override Type</Label>
            <Select value={overrideType} onValueChange={handleTypeChange}>
              <SelectTrigger id="override-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">PASS</SelectItem>
                <SelectItem value="fail">FAIL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              placeholder="Enter User ID"
              value={userId}
              onChange={handleUserIdChange}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              disabled={isPending || !userId}
              onClick={handleAdd}
              className={overrideType === 'pass' ? 'bg-primary' : 'bg-destructive'}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : undefined}
              Add {overrideType.toUpperCase()} Override
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  },
)

AddOverrideForm.displayName = 'AddOverrideForm'
