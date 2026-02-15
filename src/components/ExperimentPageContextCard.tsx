import { AlertCircle, CheckCircle2, User } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import type { Group } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

interface ExperimentPageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  groups: Group[]
  onAddOverride: (userId: string, groupId: string) => void
}

export const ExperimentPageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    canEdit,
    isPending,
    groups,
    onAddOverride,
  }: ExperimentPageContextCardProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState('')

    const handleOverride = useCallback(() => {
      if (detectedUserId && selectedGroupId) {
        onAddOverride(detectedUserId, selectedGroupId)
      }
    }, [detectedUserId, selectedGroupId, onAddOverride])

    return (
      <Card className="bg-muted/30 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {detectedUser ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium">Page Context</h4>
              {detectedUser ? (
                <div className="text-sm text-muted-foreground">
                  <p>Statsig User detected on current page.</p>
                  <div className="mt-2 flex items-center gap-2 rounded border bg-background p-2 font-mono text-xs">
                    <User className="h-3 w-3" />
                    <span className="truncate">{detectedUserId || 'Unknown ID'}</span>
                  </div>
                  {!isDetectedUserOverridden &&
                    canEdit &&
                    detectedUserId &&
                    detectedUserId !== 'Unknown ID' && (
                      <div className="mt-3 flex items-center gap-2">
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                          <SelectTrigger
                            className="h-8 w-[140px] bg-background"
                            aria-label="Select group for detected user"
                          >
                            <SelectValue placeholder="Select group" />
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
                          variant="outline"
                          className="h-8 border-primary/20 text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={handleOverride}
                          disabled={isPending || !selectedGroupId}
                        >
                          Override
                        </Button>
                      </div>
                    )}
                  {isDetectedUserOverridden && (
                    <p className="mt-2 text-xs text-green-600">
                      Override already active for this user.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Statsig user detected on the current page. You can still add a manual override
                  below.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

ExperimentPageContextCard.displayName = 'ExperimentPageContextCard'
