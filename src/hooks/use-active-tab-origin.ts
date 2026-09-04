import { useEffect, useState } from 'react'

import { getActiveTabOrigin } from '@/src/lib/tabs'

export const useActiveTabOrigin = () => {
  const [origin, setOrigin] = useState<string>()

  useEffect(() => {
    let mounted = true

    void getActiveTabOrigin().then((value) => {
      if (mounted) {
        setOrigin(value)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return origin
}
