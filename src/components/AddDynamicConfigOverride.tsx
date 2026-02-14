import { Loader2, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'

interface AddDynamicConfigOverrideProps {
  isPending: boolean
  onAdd: (userId: string, returnValue: Record<string, unknown>) => void
}

export const AddDynamicConfigOverride = ({ isPending, onAdd }: AddDynamicConfigOverrideProps) => {
  const [userId, setUserId] = useState('')
  const [jsonValue, setJsonValue] = useState('{}')
  const [jsonError, setJsonError] = useState<string | undefined>()

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonValue(e.target.value)
    try {
      JSON.parse(e.target.value)
      setJsonError(undefined)
    } catch {
      setJsonError('Invalid JSON')
    }
  }, [])

  const handleAdd = useCallback(() => {
    try {
      const parsedValue = JSON.parse(jsonValue) as Record<string, unknown>
      onAdd(userId, parsedValue)
      setUserId('')
      setJsonValue('{}')
    } catch {
      setJsonError('Invalid JSON')
    }
  }, [jsonValue, onAdd, userId])

  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
      <h4 className="text-sm font-medium">Add Override</h4>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="returnValue">Return Value (JSON)</Label>
          <Textarea
            id="returnValue"
            placeholder='{ "key": "value" }'
            value={jsonValue}
            onChange={handleJsonChange}
            className={`font-mono text-xs min-h-[100px] ${jsonError ? 'border-destructive' : ''}`}
          />
          {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={!userId || Boolean(jsonError) || isPending}
          onClick={handleAdd}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Override
        </Button>
      </div>
    </div>
  )
}
