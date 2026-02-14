import { useCallback, useState } from 'react'

export const useSettingsFormState = (initialApiKey: string, initialValue: string) => {
  const [apiKeyValue, setApiKeyValue] = useState(initialApiKey)
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(false)

  const handleApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyValue(event.target.value)
  }, [])

  const handleValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setError(false)
  }, [])

  return {
    apiKeyValue,
    error,
    handleApiKeyChange,
    handleValueChange,
    setError,
    value,
  }
}
