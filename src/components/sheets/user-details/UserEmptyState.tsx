import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'

interface UserEmptyStateProps {
  onRefetch: () => void
}

export const UserEmptyState = memo(({ onRefetch }: UserEmptyStateProps) => (
  <GeneralEmptyState variant="user" className="py-12">
    <Button onClick={onRefetch} variant="outline" size="sm" className="mt-4">
      Try Again
    </Button>
  </GeneralEmptyState>
))

UserEmptyState.displayName = 'UserEmptyState'
