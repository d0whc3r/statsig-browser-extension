import { useQuery } from '@tanstack/react-query'

import { getUserDetails } from '../handlers/get-user-details'

export const useUserDetails = () =>
  useQuery({
    queryFn: async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs[0]?.id) {
        throw new Error('No active tab found')
      }
      const details = await getUserDetails(tabs[0].id)
      return details?.user || {}
    },
    queryKey: ['user-details'],
    refetchOnWindowFocus: false,
    retry: false,
  })
