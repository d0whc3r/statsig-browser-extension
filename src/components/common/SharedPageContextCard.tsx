import type { ReactNode } from 'react'

import { memo } from 'react'

interface SharedPageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  children?: ReactNode
}

export const SharedPageContextCard = memo(({ detectedUser, detectedUserId, children }: SharedPageContextCardProps) => (
  <div className="space-y-4">
    {detectedUser ? (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Current User:</span>
        <span className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-sm font-medium text-foreground">
          {detectedUserId || 'Unknown ID'}
        </span>
      </div>
    ) : (
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">No User Context Detected.</span>{' '}
        <span className="text-xs">Manual override only.</span>
      </div>
    )}

    {detectedUser && children}
  </div>
))

SharedPageContextCard.displayName = 'SharedPageContextCard'
