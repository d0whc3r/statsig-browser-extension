import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDetectedStatsigKeys } from './use-detected-statsig-keys'

const { getActiveTabMock, getUserDetailsMock, setDetectedKeysMock } = vi.hoisted(() => ({
  getActiveTabMock: vi.fn(),
  getUserDetailsMock: vi.fn(),
  setDetectedKeysMock: vi.fn(),
}))

vi.mock('@/src/handlers/get-user-details', () => ({
  getUserDetails: getUserDetailsMock,
}))

vi.mock('@/src/lib/tabs', () => ({
  getActiveTab: getActiveTabMock,
}))

vi.mock('@/src/store/use-context-store', () => ({
  useContextStore: (selector: (state: unknown) => unknown) => selector({ setDetectedKeys: setDetectedKeysMock }),
}))

describe('useDetectedStatsigKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveTabMock.mockResolvedValue({ id: 7 })
  })

  it('stores the keys read from the inspected page', async () => {
    const keys = { gateHashes: ['1'], hashedSdkKeys: ['2447027979'], sdkKeys: ['client-a'] }
    getUserDetailsMock.mockResolvedValue({ keys, user: {} })

    renderHook(() => {
      useDetectedStatsigKeys()
    })

    await vi.waitFor(() => {
      expect(getUserDetailsMock).toHaveBeenCalledWith(7)
    })
    expect(setDetectedKeysMock).toHaveBeenCalledWith(keys)
  })

  it('clears the keys when the page exposes no Statsig identifiers', async () => {
    getUserDetailsMock.mockResolvedValue({ user: {} })

    renderHook(() => {
      useDetectedStatsigKeys()
    })

    await vi.waitFor(() => {
      expect(setDetectedKeysMock).toHaveBeenCalledWith(null)
    })
  })

  it('does nothing without an active tab', async () => {
    getActiveTabMock.mockResolvedValue(null)

    renderHook(() => {
      useDetectedStatsigKeys()
    })

    await vi.waitFor(() => {
      expect(getActiveTabMock).toHaveBeenCalled()
    })
    expect(getUserDetailsMock).not.toHaveBeenCalled()
    expect(setDetectedKeysMock).not.toHaveBeenCalled()
  })
})
