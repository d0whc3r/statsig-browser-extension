import type { WxtStorageItem } from 'wxt/utils/storage'

import { useEffect, useRef, useState } from 'react'

export function useWxtStorage<T>(item: WxtStorageItem<T, Record<string, unknown>>): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState(item.fallback)
  const [isLoading, setIsLoading] = useState(true)
  const revision = useRef(0)

  useEffect(() => {
    let mounted = true
    // Do not set isLoading to true here. We want to keep the old value while fetching the new one if the item changes.
    // Or if it's the first mount, isLoading is already true (default state).

    const initialRevision = revision.current
    const init = async () => {
      try {
        const val = await item.getValue()
        if (mounted) {
          // A watcher or local write can be newer than this initial snapshot.
          if (revision.current === initialRevision) {
            setValue(val)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to get storage value:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void init()

    const unwatch = item.watch((val: T) => {
      if (mounted) {
        revision.current += 1
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

    revision.current += 1
    setValue(newValue)
    item.setValue(newValue).catch((error) => {
      console.error('Failed to set storage value:', error)
      // Revert on failure? Or just log?
    })
  }

  return [value, setStorageValue, isLoading]
}
