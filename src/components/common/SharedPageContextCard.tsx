import type { ReactNode } from 'react'

import { AlertCircle, CheckCircle2, User } from 'lucide-react'
import { memo } from 'react'

import { Card, CardContent } from '@/src/components/ui/card'

interface SharedPageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  isDetectedUserOverridden: boolean
  children?: ReactNode
}

export const SharedPageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    children,
  }: SharedPageContextCardProps) => (
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
                <div className="mt-2 flex items-center gap-2 rounded border bg-background p-2 font-mono text-xs">
                  <User className="h-3 w-3" />
                  <span className="truncate">{detectedUserId || 'Unknown ID'}</span>
                </div>
                {!isDetectedUserOverridden && children}
                {isDetectedUserOverridden && (
                  <p className="mt-2 text-xs text-green-600">
                    Override already active for this user.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No Statsig user detected on the current page. Automatic override is not available.
                Please use the manual override below.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ),
)

SharedPageContextCard.displayName = 'SharedPageContextCard'
