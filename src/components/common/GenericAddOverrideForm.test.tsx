import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { GenericAddOverrideForm } from './GenericAddOverrideForm'

vi.mock('@/src/hooks/use-unit-id-types', () => ({
  useUnitIDTypes: () => ({ data: ['userID', 'stableID'] }),
}))

const OVERRIDE_VALUES = [
  { label: 'PASS', value: 'pass' },
  { label: 'FAIL', value: 'fail' },
]

const submitButtonText = (value: string) => `Add ${value.toUpperCase()} Override`

const renderForm = (onAddOverride = vi.fn(), onCancel = vi.fn()) => {
  const { user } = renderWithProviders(
    <GenericAddOverrideForm
      getSubmitButtonText={submitButtonText}
      isPending={false}
      onAddOverride={onAddOverride}
      onCancel={onCancel}
      onValueChange={vi.fn()}
      selectedValue="pass"
      valueLabel="Override Type"
      values={OVERRIDE_VALUES}
    />,
  )

  return { onAddOverride, onCancel, user }
}

describe('genericAddOverrideForm', () => {
  it('disables submit until an id is entered, then submits with environment and id type', async () => {
    const { onAddOverride, user } = renderForm()

    expect(screen.getByRole('button', { name: /add pass override/iu })).toBeDisabled()
    await user.type(screen.getByLabelText(/id value/iu), 'user_99')
    await user.click(screen.getByRole('button', { name: /add pass override/iu }))

    await waitFor(() => {
      expect(onAddOverride).toHaveBeenCalledWith({
        environment: 'Production',
        id: 'user_99',
        idType: 'userID',
        value: 'pass',
      })
    })
  })

  it('maps All Environments to a null environment and calls onCancel', async () => {
    const { onAddOverride, onCancel, user } = renderForm()

    await user.click(screen.getByLabelText(/environment/iu))
    await user.click(screen.getByRole('option', { name: /all environments/iu }))
    await user.type(screen.getByLabelText(/id value/iu), 'user_1')
    await user.click(screen.getByRole('button', { name: /add pass override/iu }))

    await waitFor(() => {
      expect(onAddOverride).toHaveBeenCalledWith(expect.objectContaining({ environment: null, id: 'user_1' }))
    })

    await user.click(screen.getByRole('button', { name: /cancel/iu }))
    expect(onCancel).toHaveBeenCalled()
  })
})
