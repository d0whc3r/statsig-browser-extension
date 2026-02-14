import { useCallback } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserDetailsContent } from '@/src/components/sheets/user-details/UserDetailsContent'
import { UserDetailsHeader } from '@/src/components/sheets/user-details/UserDetailsHeader'
import { UserDetailsSkeleton } from '@/src/components/sheets/user-details/UserDetailsSkeleton'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useStore } from '@/src/store/use-store'

export const UserDetailsSheet = () => {
  const { isUserDetailsSheetOpen, setUserDetailsSheetOpen } = useStore((state) => state)
  const { data: userDetailsData, isLoading, refetch } = useUserDetails()

  const userDetails = userDetailsData as StatsigUser | undefined

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <Sheet open={isUserDetailsSheetOpen} onOpenChange={setUserDetailsSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <UserDetailsHeader isLoading={isLoading} onRefetch={handleRefetch} />

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <UserDetailsSkeleton />
            ) : (
              <UserDetailsContent userDetails={userDetails} onRefetch={handleRefetch} />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
