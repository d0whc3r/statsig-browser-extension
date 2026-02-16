import { useCallback, useState } from 'react'

export const useSettingsFormState = (initialValue: string) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(false)

  const handleValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setError(false)
  }, [])

  return {
    error,
    handleValueChange,
    setError,
    value,
  }
}
