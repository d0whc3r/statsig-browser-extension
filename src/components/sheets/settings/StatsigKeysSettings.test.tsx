import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { Form } from '@/src/components/ui/form'

import { StatsigKeysSettings } from './StatsigKeysSettings'

function Harness({
  defaultValues,
  children,
}: {
  defaultValues: SettingsFormValues
  children: (control: ReturnType<typeof useForm<SettingsFormValues>>['control']) => React.ReactNode
}) {
  const form = useForm<SettingsFormValues>({ defaultValues })
  return <Form {...form}>{children(form.control)}</Form>
}

describe('statsigKeysSettings', () => {
  it('renders the localStorageKey input with the form default value', () => {
    render(
      <Harness defaultValues={{ localStorageKey: 'statsig_user' }}>
        {(control) => <StatsigKeysSettings control={control} />}
      </Harness>,
    )
    expect(screen.getByRole('textbox')).toHaveValue('statsig_user')
  })

  it('reflects user typing into the input', async () => {
    const user = userEvent.setup()
    render(
      <Harness defaultValues={{ localStorageKey: '' }}>
        {(control) => <StatsigKeysSettings control={control} />}
      </Harness>,
    )
    const input = screen.getByRole('textbox')
    await user.type(input, 'my_key')
    expect(input).toHaveValue('my_key')
  })
})
