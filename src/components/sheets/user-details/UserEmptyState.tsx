import { User } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'

interface UserEmptyStateProps {
  onRefetch: () => void
}

export const UserEmptyState = memo(({ onRefetch }: UserEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
      <User className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="font-semibold">No User Found</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        We couldn&apos;t detect a Statsig user on this page. Make sure the SDK is initialized.
      </p>
    </div>
    <Button onClick={onRefetch} variant="outline" size="sm">
      Try Again
    </Button>
  </div>
))

UserEmptyState.displayName = 'UserEmptyState'
