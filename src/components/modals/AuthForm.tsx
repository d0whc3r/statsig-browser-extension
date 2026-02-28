import type { ControllerRenderProps } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2 } from 'lucide-react'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/src/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import { initialLogin } from '@/src/handlers/initial-login'
import { useSettingsStorage } from '@/src/hooks/use-settings-storage'

const authSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'Please enter an API key')
    .startsWith('console-', 'API key should start with "console-"'),
})

type AuthFormValues = z.infer<typeof authSchema>

interface AuthFormProps {
  onSuccess: () => void
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const { setApiKey } = useSettingsStorage()
  const queryClient = useQueryClient()

  const form = useForm<AuthFormValues>({
    defaultValues: {
      apiKey: '',
    },
    resolver: zodResolver(authSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: initialLogin,
    onError: (error) => {
      form.setError('apiKey', {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      })
    },
    onSuccess: (data, variables) => {
      if (data.error) {
        form.setError('apiKey', { message: data.error })
        return
      }

      if (data.success) {
        setApiKey(variables)
        queryClient.invalidateQueries()
        onSuccess()
      }
    },
  })

  const onSubmit = useCallback(
    (values: AuthFormValues) => {
      mutate(values.apiKey)
    },
    [mutate],
  )

  const renderApiKeyField = useCallback(
    ({ field }: { field: ControllerRenderProps<AuthFormValues, 'apiKey'> }) => (
      <FormItem>
        <FormLabel>Statsig Console API Key</FormLabel>
        <FormControl>
          <Input placeholder="console-..." {...field} disabled={isPending} />
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    [isPending],
  )

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField control={form.control} name="apiKey" render={renderApiKeyField} />

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
