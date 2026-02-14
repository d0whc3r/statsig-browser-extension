import { useState, useEffect } from 'react'

export function useLocalStorage<ValueType>(
  storageKey: string,
  initialValue: ValueType,
): [ValueType, (value: ValueType) => void] {
  // Get from local storage then
  // Parse stored json or if none return initialValue
  const readValue = (): ValueType => {
    if (globalThis.window === undefined) {
      return initialValue
    }

    try {
      const item = globalThis.localStorage.getItem(storageKey)
      return item ? (JSON.parse(item) as ValueType) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<ValueType>(readValue)

  const setValue = (value: ValueType) => {
    try {
      // eslint-disable-next-line unicorn/no-instanceof-builtins
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (globalThis.window !== undefined) {
        globalThis.localStorage.setItem(storageKey, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error)
    }
  }

  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [storedValue, setValue]
}
