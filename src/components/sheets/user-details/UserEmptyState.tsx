import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'

interface UserEmptyStateProps {
  onRefetch: () => void
  error?: string | null
}

export const UserEmptyState = memo(({ onRefetch, error }: UserEmptyStateProps) => (
  <GeneralEmptyState
    variant="user"
    className="py-12"
    description={error ? 'We encountered an issue detecting the Statsig user.' : undefined}
  >
    {error && <div className="text-sm text-destructive max-w-xs text-center mb-4">{error}</div>}
    <Button onClick={onRefetch} variant="outline" size="sm" className="mt-4">
      {error ? 'Retry Detection' : 'Try Again'}
    </Button>
  </GeneralEmptyState>
))

UserEmptyState.displayName = 'UserEmptyState'
