import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExperimentOverridesLogic } from '@/src/hooks/use-experiment-overrides-logic'

import { ExperimentOverrides } from '@/src/components/ExperimentOverrides'

vi.mock('@/src/hooks/use-experiment-overrides-logic')

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockGroup = {
  id: 'group-a',
  name: 'Group A',
  parameterValues: {},
  size: 50,
}

describe('ExperimentOverrides', () => {
  const mockHandleAdd = vi.fn()
  const mockHandleDelete = vi.fn()
  const mockSaveToLocalStorage = vi.fn()
  const mockClearOverride = vi.fn()

  const defaultMockValues = {
    currentLocalStorageValue: '',
    newId: '',
    setNewId: vi.fn(),
    selectedGroupId: '',
    setSelectedGroupId: vi.fn(),
    isPending: false,
    saveToLocalStorage: mockSaveToLocalStorage,
    clearOverride: mockClearOverride,
    handleAdd: mockHandleAdd,
    handleDelete: mockHandleDelete,
    canEdit: true,
    detectedUser: undefined,
    detectedUserId: undefined,
    isDetectedUserOverridden: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useExperimentOverridesLogic).mockReturnValue(defaultMockValues as any)
  })

  it('renders context card when user is detected', () => {
    vi.mocked(useExperimentOverridesLogic).mockReturnValue({
      ...defaultMockValues,
      detectedUser: { userID: 'user-123' },
      detectedUserId: 'user-123',
    } as any)

    render(<ExperimentOverrides overrides={[]} groups={[mockGroup]} />)

    expect(screen.getByText('Page Context')).toBeInTheDocument()
    expect(screen.getByText('user-123')).toBeInTheDocument()
  })

  it('calls handleAdd when override button is clicked in context card', async () => {
    vi.mocked(useExperimentOverridesLogic).mockReturnValue({
      ...defaultMockValues,
      detectedUser: { userID: 'user-123' },
      detectedUserId: 'user-123',
    } as any)

    const user = userEvent.setup()
    render(<ExperimentOverrides overrides={[]} groups={[mockGroup]} />)

    // Select group
    const trigger = screen.getByRole('combobox', { name: /Select group for detected user/i })
    await user.click(trigger)

    const option = await screen.findByRole('option', { name: 'Group A' })
    await user.click(option)

    // Click override
    const button = screen.getByRole('button', { name: 'Override' })
    await user.click(button)

    expect(mockHandleAdd).toHaveBeenCalledWith('user-123', 'group-a')
  })
})
