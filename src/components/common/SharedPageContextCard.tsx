import type { ReactNode } from 'react'

import { AlertCircle, CheckCircle2, User } from 'lucide-react'
import { memo } from 'react'

import { Card, CardContent } from '@/src/components/ui/card'

interface SharedPageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  children?: ReactNode
}

export const SharedPageContextCard = memo(
  ({ detectedUser, detectedUserId, children }: SharedPageContextCardProps) => (
    <Card className="bg-muted/30 shadow-sm border-dashed">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            {detectedUser ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {detectedUser ? (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Current User Context</p>
                <div className="mt-2.5 flex items-center gap-2 rounded-md border bg-background px-3 py-2 font-mono text-xs shadow-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{detectedUserId || 'Unknown ID'}</span>
                </div>
                <div className="mt-4">{children}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">No User Context Detected</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Automatic override is not available. Please use the manual override below.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ),
)

SharedPageContextCard.displayName = 'SharedPageContextCard'
