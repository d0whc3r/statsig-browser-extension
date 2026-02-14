import { RefreshCw } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { cn } from '@/src/lib/utils'

interface UserDetailsHeaderProps {
  isLoading: boolean
  onRefetch: () => void
}

export const UserDetailsHeader = memo(({ isLoading, onRefetch }: UserDetailsHeaderProps) => (
  <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
    <div>
      <SheetTitle>User Details</SheetTitle>
      <p className="text-xs text-muted-foreground">Statsig SDK identity on this page</p>
    </div>
    <Button variant="ghost" size="icon" onClick={onRefetch} disabled={isLoading}>
      <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
    </Button>
  </SheetHeader>
))

UserDetailsHeader.displayName = 'UserDetailsHeader'
