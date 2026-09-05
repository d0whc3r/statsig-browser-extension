import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeFeatureGate, makeGateOverride } from '@/src/tests/fixtures/statsig'
import { renderHookWithProviders } from '@/src/tests/utils/TestUtils'

import { useGateOverridesLogic } from './use-gate-overrides-logic'

vi.mock('@/src/hooks/use-wxt-storage', () => ({
  useWxtStorage: () => ['write-key', vi.fn(), false],
}))

vi.mock('@/src/hooks/use-user-details', () => ({
  useUserDetails: () => ({ data: { userID: 'u_current' } }),
}))

vi.mock('@/src/handlers/gate-overrides', () => ({
  deleteGateOverrides: vi.fn(),
  updateGateOverrides: vi.fn(),
}))

describe('useGateOverridesLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('flattens root and environment overrides and flags the current user', () => {
    const overrides = makeGateOverride({
      environmentOverrides: [
        { environment: 'Production', failingIDs: ['u_fail'], passingIDs: ['u_pass'], unitID: 'userID' },
      ],
      failingUserIDs: ['u_root_fail'],
      passingUserIDs: ['u_current'],
    })
    const { result } = renderHookWithProviders(() =>
      useGateOverridesLogic('gate-1', overrides, makeFeatureGate({ idType: 'userID' })),
    )

    expect(result.current.canEdit).toBeTruthy()
    expect(result.current.detectedUserId).toBe('u_current')
    expect(result.current.isDetectedUserOverridden).toBeTruthy()
    expect(result.current.allOverrides).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'u_current', isCurrentUser: true, type: 'pass' }),
        expect.objectContaining({ id: 'u_root_fail', type: 'fail' }),
        expect.objectContaining({ environment: 'Production', id: 'u_pass', type: 'pass' }),
        expect.objectContaining({ environment: 'Production', id: 'u_fail', type: 'fail' }),
      ]),
    )
  })

  it('starts on the table view and can switch to the form', () => {
    const { result } = renderHookWithProviders(() => useGateOverridesLogic('gate-1', makeGateOverride()))

    expect(result.current.view).toBe('table')
    act(() => {
      result.current.handleSwitchToForm()
    })
    expect(result.current.view).toBe('form')
    act(() => {
      result.current.handleSwitchToTable()
    })
    expect(result.current.view).toBe('table')
  })
})
