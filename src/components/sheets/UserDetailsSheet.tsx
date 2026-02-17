import { useCallback } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserDetailsContent } from '@/src/components/sheets/user-details/UserDetailsContent'
import { UserDetailsHeader } from '@/src/components/sheets/user-details/UserDetailsHeader'
import { UserDetailsSkeleton } from '@/src/components/sheets/user-details/UserDetailsSkeleton'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { useDetectedUser } from '@/src/hooks/use-detected-user'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useContextStore } from '@/src/store/use-context-store'
import { useUIStore } from '@/src/store/use-ui-store'

export const UserDetailsSheet = () => {
  const { isUserDetailsSheetOpen, setUserDetailsSheetOpen } = useUIStore((state) => state)
  const { data: userDetailsData, isLoading, refetch } = useUserDetails()
  const { retryDetection } = useDetectedUser()
  const detectionError = useContextStore((state) => state.detectionError)

  const userDetails = userDetailsData as StatsigUser | undefined

  const handleRefetch = useCallback(() => {
    refetch()
    retryDetection()
  }, [refetch, retryDetection])

  return (
    <Sheet open={isUserDetailsSheetOpen} onOpenChange={setUserDetailsSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full overflow-hidden p-0 gap-0">
        <UserDetailsHeader isLoading={isLoading} onRefetch={handleRefetch} />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <UserDetailsSkeleton />
            ) : (
              <UserDetailsContent
                userDetails={userDetails}
                onRefetch={handleRefetch}
                error={detectionError}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
