import { AlertCircle, CheckCircle2, User } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'

import type { OverrideType } from './types'

interface PageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  onAddOverride: (userId: string, type: OverrideType) => void
}

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    canEdit,
    isPending,
    onAddOverride,
  }: PageContextCardProps) => {
    const handleOverridePass = useCallback(
      () => onAddOverride(detectedUserId, 'pass'),
      [detectedUserId, onAddOverride],
    )

    const handleOverrideFail = useCallback(
      () => onAddOverride(detectedUserId, 'fail'),
      [detectedUserId, onAddOverride],
    )

    return (
      <Card className="bg-muted/30">
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
                  <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded border font-mono text-xs">
                    <User className="h-3 w-3" />
                    <span className="truncate">{detectedUserId || 'Unknown ID'}</span>
                  </div>
                  {!isDetectedUserOverridden &&
                    canEdit &&
                    detectedUserId &&
                    detectedUserId !== 'Unknown ID' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-900/20"
                          onClick={handleOverridePass}
                          disabled={isPending}
                        >
                          Override PASS
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/20"
                          onClick={handleOverrideFail}
                          disabled={isPending}
                        >
                          Override FAIL
                        </Button>
                      </div>
                    )}
                  {isDetectedUserOverridden && (
                    <p className="text-xs text-green-600 mt-2">
                      Override already active for this user.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Statsig user detected on the current page. Make sure you are on a page with
                  Statsig initialized.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
