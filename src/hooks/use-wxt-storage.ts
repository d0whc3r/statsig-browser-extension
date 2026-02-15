import type { WxtStorageItem } from 'wxt/utils/storage'

import { useEffect, useState } from 'react'

export function useWxtStorage<T>(item: WxtStorageItem<T, any>): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(item.defaultValue as T)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    item.getValue().then((val: T) => {
      if (mounted) {
        setValue(val)
        setIsLoading(false)
      }
    })
    const unwatch = item.watch((val: T) => {
      if (mounted) {
        setValue(val)
      }
    })
    return () => {
      mounted = false
      unwatch()
    }
  }, [item])

  const setStorageValue = (newValue: T) => {
    setValue(newValue)
    item.setValue(newValue)
  }

  return [value, setStorageValue, isLoading]
}
