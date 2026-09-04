import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import React, { useCallback, useState } from 'react'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { initialLogin } from '@/src/handlers/initial-login'
import { useAddProject } from '@/src/hooks/use-projects'
import { useSettingsStore } from '@/src/store/use-settings-store'

interface AddProjectFormProps {
  /** Pin the inspected site to the new project, so the extension keeps using it there. */
  pinOrigin?: boolean
}

export function AddProjectForm({ pinOrigin = false }: Readonly<AddProjectFormProps>) {
  const projects = useSettingsStore((state) => state.projects)
  const addProject = useAddProject()
  const queryClient = useQueryClient()

  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string>()

  const { isPending, mutate } = useMutation({
    mutationFn: initialLogin,
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'An unknown error occurred')
    },
    onSuccess: (data, variables) => {
      if (!data.success || data.error) {
        setError(data.error ?? 'The API key was rejected by Statsig')
        return
      }

      setApiKey('')
      void addProject(variables, pinOrigin).then(() => queryClient.invalidateQueries())
    },
  })

  const handleApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
    setError(undefined)
  }, [])

  const handleAdd = useCallback(() => {
    const value = apiKey.trim()
    if (!value.startsWith('console-')) {
      setError('API key should start with "console-"')
      return
    }
    /* In the page gate, entering a configured key again means "this site is that project", which
     * pins the site instead of being rejected. */
    if (!pinOrigin && projects.some((project) => project.apiKey === value)) {
      setError('That project is already configured')
      return
    }
    mutate(value)
  }, [apiKey, mutate, pinOrigin, projects])

  // The settings sheet is already a form, so Enter must add the key instead of saving the settings.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleAdd()
      }
    },
    [handleAdd],
  )

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">Add project</Label>
      <div className="flex items-start gap-2">
        <Input
          value={apiKey}
          onChange={handleApiKeyChange}
          onKeyDown={handleKeyDown}
          placeholder="console-..."
          disabled={isPending}
          aria-label="Statsig Console API Key"
        />
        <Button type="button" variant="outline" onClick={handleAdd} disabled={isPending} className="gap-1">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
