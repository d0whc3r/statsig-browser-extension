import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { Form } from '@/src/components/ui/form'

import { StatsigKeysSettings } from './StatsigKeysSettings'
import { StorageSettings } from './StorageSettings'

const Harness = ({
  defaultValues,
  children,
}: {
  defaultValues: SettingsFormValues
  children: (control: ReturnType<typeof useForm<SettingsFormValues>>['control']) => React.ReactNode
}) => {
  const form = useForm<SettingsFormValues>({ defaultValues })
  return <Form {...form}>{children(form.control)}</Form>
}

describe('storageSettings', () => {
  it('renders the current storage type', () => {
    render(
      <Harness defaultValues={{ localStorageKey: 'k', storageType: 'cookie' }}>
        {(control) => <StorageSettings control={control} />}
      </Harness>,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent(/cookies/iu)
  })

  it('updates the form value when the user picks a different storage type', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(
      <Harness defaultValues={{ localStorageKey: 'k', storageType: 'localStorage' }}>
        {(control) => <StorageSettings control={control} />}
      </Harness>,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /cookies/iu }))

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent(/cookies/iu)
    })
  })
})

describe('statsigKeysSettings', () => {
  it('renders the localStorageKey input with the form default value', () => {
    render(
      <Harness defaultValues={{ localStorageKey: 'statsig_user', storageType: 'localStorage' }}>
        {(control) => <StatsigKeysSettings control={control} />}
      </Harness>,
    )
    expect(screen.getByRole('textbox')).toHaveValue('statsig_user')
  })

  it('reflects user typing into the input', async () => {
    const user = userEvent.setup()
    render(
      <Harness defaultValues={{ localStorageKey: '', storageType: 'localStorage' }}>
        {(control) => <StatsigKeysSettings control={control} />}
      </Harness>,
    )
    const input = screen.getByRole('textbox')
    await user.type(input, 'my_key')
    expect(input).toHaveValue('my_key')
  })
})
