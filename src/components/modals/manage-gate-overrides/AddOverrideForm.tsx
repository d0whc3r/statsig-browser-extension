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
  onAddOverride: (
    userId: string,
    type: OverrideType,
    environment: string | null,
    idType: string | null,
  ) => void
  onCancel: () => void
}

export const AddOverrideForm = memo(
  ({ isPending, onAddOverride, onCancel }: AddOverrideFormProps) => {
    const [overrideType, setOverrideType] = useState<OverrideType>('pass')
    const [userId, setUserId] = useState('')
    const [environment, setEnvironment] = useState<string>('Production')
    const [idType, setIdType] = useState<string>('userID')

    const handleAdd = useCallback(() => {
      // If environment is 'All Environments' (or empty/null representation), pass null
      const env = environment === 'All Environments' ? null : environment
      onAddOverride(userId, overrideType, env, idType)
    }, [userId, overrideType, environment, idType, onAddOverride])

    const handleTypeChange = useCallback((val: string) => {
      setOverrideType(val as OverrideType)
    }, [])

    const handleUserIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setUserId(event.target.value)
    }, [])

    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
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
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger id="environment">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Environments">All Environments</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="id-type">ID Type</Label>
            <Select value={idType} onValueChange={setIdType}>
              <SelectTrigger id="id-type">
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="userID">User ID</SelectItem>
                <SelectItem value="stableID">Stable ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="user-id">ID Value</Label>
            <Input
              id="user-id"
              placeholder="Enter ID"
              value={userId}
              onChange={handleUserIdChange}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
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
