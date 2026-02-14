import { memo } from 'react'

import { Skeleton } from '@/src/components/ui/skeleton'

export const UserDetailsSkeleton = memo(() => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-[200px] w-full" />
  </div>
))

UserDetailsSkeleton.displayName = 'UserDetailsSkeleton'
