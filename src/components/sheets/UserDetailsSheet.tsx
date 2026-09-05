import { useCallback, useState } from 'react'

import { UserDetailsContent } from '@/src/components/sheets/user-details/UserDetailsContent'
import { UserDetailsHeader } from '@/src/components/sheets/user-details/UserDetailsHeader'
import { UserDetailsSkeleton } from '@/src/components/sheets/user-details/UserDetailsSkeleton'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { useDetectedUser } from '@/src/hooks/use-detected-user'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useContextStore } from '@/src/store/use-context-store'
import { useUIStore } from '@/src/store/use-ui-store'

/** The content script answers from cache in a few ms, so hold the spinner long enough to be noticed. */
const MIN_FEEDBACK_MS = 400

export function UserDetailsSheet() {
  const { isUserDetailsSheetOpen, setUserDetailsSheetOpen } = useUIStore((state) => state)
  const { data: userDetailsData, isLoading, refetch } = useUserDetails()
  const { retryDetection } = useDetectedUser()
  const detectionError = useContextStore((state) => state.detectionError)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<number>()

  const userDetails = userDetailsData

  const handleRefetch = useCallback(() => {
    setIsRetrying(true)
    void Promise.all([
      refetch(),
      retryDetection(),
      new Promise((resolve) => {
        setTimeout(resolve, MIN_FEEDBACK_MS)
      }),
    ]).finally(() => {
      setLastCheckedAt(Date.now())
      setIsRetrying(false)
    })
  }, [refetch, retryDetection])

  return (
    <Sheet open={isUserDetailsSheetOpen} onOpenChange={setUserDetailsSheetOpen}>
      <SheetContent className="flex h-full w-[400px] flex-col gap-0 overflow-hidden p-0 sm:w-[540px]">
        <UserDetailsHeader isLoading={isLoading || isRetrying} onRefetch={handleRefetch} />

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-6">
            {isLoading ? (
              <UserDetailsSkeleton />
            ) : (
              <UserDetailsContent
                userDetails={userDetails}
                onRefetch={handleRefetch}
                error={detectionError}
                isRetrying={isRetrying}
                lastCheckedAt={lastCheckedAt}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
