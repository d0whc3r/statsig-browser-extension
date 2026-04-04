import { useCallback } from 'react'

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

  const userDetails = userDetailsData

  const handleRefetch = useCallback(() => {
    void refetch()
    void retryDetection()
  }, [refetch, retryDetection])

  return (
    <Sheet open={isUserDetailsSheetOpen} onOpenChange={setUserDetailsSheetOpen}>
      <SheetContent className="flex h-full w-[400px] flex-col gap-0 overflow-hidden p-0 sm:w-[540px]">
        <UserDetailsHeader isLoading={isLoading} onRefetch={handleRefetch} />

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-6">
            {isLoading ? (
              <UserDetailsSkeleton />
            ) : (
              <UserDetailsContent userDetails={userDetails} onRefetch={handleRefetch} error={detectionError} />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
