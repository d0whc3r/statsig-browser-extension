import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { initialLogin } from '@/src/handlers/initial-login'
import { useLocalStorage } from '@/src/hooks/use-local-storage'

interface AuthFormProps {
  onSuccess: () => void
  isOpen: boolean
}

export const AuthForm = ({ onSuccess, isOpen }: AuthFormProps) => {
  const [, setApiKey] = useLocalStorage('statsig-console-api-key', '')
  const [value, setValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: initialLogin,
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    },
    onSuccess: (data) => {
      if (data.error) {
        setErrorMessage(data.error)
        return
      }

      if (data.success) {
        setApiKey(value)
        setErrorMessage(undefined)
        queryClient.invalidateQueries()
        onSuccess()
      }
    },
  })

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(undefined)
    }
  }, [isOpen])

  const handleLogin = useCallback(() => {
    if (!value.trim()) {
      setErrorMessage('Please enter an API key')
      return
    }
    mutate(value)
  }, [value, mutate])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleLogin()
      }
    },
    [handleLogin],
  )

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }, [])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Login to Statsig</DialogTitle>
        <DialogDescription className="pt-2 text-justify">
          Before you can use this extension, you need to login to your Statsig account. This can be
          done with a <b>Read Only Statsig Console API Key</b>. This key can be created in the{' '}
          <b>Project Settings</b> under the{' '}
          <a
            href="https://console.statsig.com/api_keys"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline inline-flex items-center"
          >
            Keys & Environments <ExternalLink className="ml-0.5 h-3 w-3" />
          </a>{' '}
          tab.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="api-key">Statsig Console API Key</Label>
          <Input
            id="api-key"
            placeholder="console-..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isPending}
          />
          {errorMessage && <p className="text-sm font-medium text-destructive">{errorMessage}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleLogin} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </DialogFooter>
    </>
  )
}
