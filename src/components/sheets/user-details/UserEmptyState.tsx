import { RefreshCw } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { TimeAgo } from '@/src/components/ui/time-ago'

interface UserEmptyStateProps {
  onRefetch: () => void
  error?: string | null
  isRetrying?: boolean
  lastCheckedAt?: number
}

export const UserEmptyState = memo(function UserEmptyState({
  error,
  isRetrying,
  lastCheckedAt,
  onRefetch,
}: UserEmptyStateProps) {
  return (
    <GeneralEmptyState
      variant="user"
      className="py-12"
      description={error ? 'We encountered an issue detecting the Statsig user.' : undefined}
    >
      {error && <div className="mb-4 max-w-xs text-center text-sm text-destructive">{error}</div>}
      <Button onClick={onRefetch} disabled={isRetrying} variant="outline" size="sm" className="mt-4">
        {isRetrying && <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {error ? 'Retry Detection' : 'Try Again'}
      </Button>
      {/* Always mounted so the outcome of a retry is announced, not just rendered */}
      <p className="mt-2 min-h-4 text-xs text-muted-foreground" aria-live="polite">
        {isRetrying && 'Checking the page…'}
        {!isRetrying && lastCheckedAt !== undefined && (
          <>
            Still no Statsig user. Last checked <TimeAgo date={lastCheckedAt} />.
          </>
        )}
      </p>
    </GeneralEmptyState>
  )
})

UserEmptyState.displayName = 'UserEmptyState'
