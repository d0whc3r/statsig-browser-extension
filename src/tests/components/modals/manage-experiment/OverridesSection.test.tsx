import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverridesSection } from '@/src/components/modals/manage-experiment/OverridesSection'
import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

vi.mock('@/src/hooks/use-overrides-section-logic')
vi.mock('@/src/components/modals/manage-experiment/OverridesList', () => ({
  OverridesList: () => <div>OverridesList Mock</div>,
}))
vi.mock('@/src/components/modals/manage-experiment/AddOverrideForm', () => ({
  AddOverrideForm: () => <div>AddOverrideForm Mock</div>,
}))
vi.mock('@/src/components/modals/manage-experiment/PageContextCard', () => ({
  PageContextCard: ({ detectedUserId }: { detectedUserId: string }) => (
    <div>
      Page Context
      <div>{detectedUserId}</div>
    </div>
  ),
}))

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

describe('OverridesSection', () => {
  const mockAddOverride = vi.fn()
  const mockHandleCreateOverrideClick = vi.fn()
  const mockHandleBackClick = vi.fn()
  const mockHandleOverrideValueChange = vi.fn()
  const mockSetSelectedGroup = vi.fn()
  const mockSetOverrideType = vi.fn()
  const mockSetOverrideValue = vi.fn()

  const defaultMockValues = {
    addOverride: mockAddOverride,
    detectedUser: undefined,
    detectedUserId: undefined,
    groups: [mockGroup],
    handleBackClick: mockHandleBackClick,
    handleCreateOverrideClick: mockHandleCreateOverrideClick,
    handleOverrideValueChange: mockHandleOverrideValueChange,
    isDetectedUserOverridden: false,
    isPending: false,
    overrideValue: '',
    selectedGroup: '',
    setSelectedGroup: mockSetSelectedGroup,
    typeApiKey: 'write-key',
    view: 'table',
    overrideType: 'user',
    setOverrideType: mockSetOverrideType,
    featureGates: [],
    setOverrideValue: mockSetOverrideValue,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOverridesSectionLogic).mockReturnValue(defaultMockValues as any)
  })

  it('renders context card when user is detected in table view', () => {
    vi.mocked(useOverridesSectionLogic).mockReturnValue({
      ...defaultMockValues,
      detectedUser: { userID: 'user-123' },
      detectedUserId: 'user-123',
    } as any)

    render(<OverridesSection />)

    expect(screen.getByText('Page Context')).toBeInTheDocument()
    expect(screen.getByText('user-123')).toBeInTheDocument()
    expect(screen.getByText('OverridesList Mock')).toBeInTheDocument()
  })

  it('renders create override form when view is form', () => {
    vi.mocked(useOverridesSectionLogic).mockReturnValue({
      ...defaultMockValues,
      view: 'form',
    } as any)

    render(<OverridesSection />)

    expect(screen.getByText('AddOverrideForm Mock')).toBeInTheDocument()
    expect(screen.queryByText('OverridesList Mock')).not.toBeInTheDocument()
  })
})
