import { useQuery } from '@tanstack/react-query'

import { getActiveTab } from '@/src/lib/tabs'

import { getUserDetails } from '../handlers/get-user-details'

export const useUserDetails = () =>
  useQuery({
    queryFn: async () => {
      const tab = await getActiveTab()
      if (!tab?.id) {
        throw new Error('No active tab found')
      }
      const details = await getUserDetails(tab.id)
      return details?.user || {}
    },
    queryKey: ['user-details'],
    refetchOnWindowFocus: false,
    retry: false,
  })
