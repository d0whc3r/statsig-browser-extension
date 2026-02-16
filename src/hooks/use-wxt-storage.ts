import type { WxtStorageItem } from 'wxt/utils/storage'

import { useEffect, useState } from 'react'

export function useWxtStorage<T>(
  item: WxtStorageItem<T, Record<string, unknown>>,
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(item.defaultValue as T)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    // Do not set isLoading to true here. We want to keep the old value while fetching the new one if the item changes.
    // Or if it's the first mount, isLoading is already true (default state).

    const init = async () => {
      try {
        const val = await item.getValue()
        if (mounted) {
          setValue(val)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to get storage value:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    init()

    const unwatch = item.watch((val: T) => {
      if (mounted) {
        setValue(val)
        setIsLoading(false)
      }
    })
    return () => {
      mounted = false
      unwatch()
    }
  }, [item])

  const setStorageValue = (newValue: T) => {
    // Only update if value actually changed
    if (value === newValue) {
      return
    }

    setValue(newValue)
    item.setValue(newValue).catch((error) => {
      console.error('Failed to set storage value:', error)
      // Revert on failure? Or just log?
    })
  }

  return [value, setStorageValue, isLoading]
}
