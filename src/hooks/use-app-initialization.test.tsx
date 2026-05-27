import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppInitialization } from './use-app-initialization'

const { initializeMock, setAuthModalOpenMock, useSettingsStorageMock } = vi.hoisted(() => ({
  initializeMock: vi.fn(),
  setAuthModalOpenMock: vi.fn(),
  useSettingsStorageMock: vi.fn(),
}))

vi.mock('@/src/hooks/use-settings-storage', () => ({
  useSettingsStorage: useSettingsStorageMock,
}))

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: (selector: (state: { initialize: typeof initializeMock }) => unknown) =>
    selector({ initialize: initializeMock }),
}))

vi.mock('@/src/store/use-ui-store', () => ({
  useUIStore: (selector: (state: { setAuthModalOpen: typeof setAuthModalOpenMock }) => unknown) =>
    selector({ setAuthModalOpen: setAuthModalOpenMock }),
}))

describe('useAppInitialization', () => {
  beforeEach(() => {
    initializeMock.mockReset()
    setAuthModalOpenMock.mockReset()
    useSettingsStorageMock.mockReset()
  })

  it('runs initializeSettings on mount', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'k', isApiKeyLoading: true })
    // oxlint-disable-next-line unicorn/no-useless-undefined
    initializeMock.mockResolvedValue(undefined)

    renderHook(() => {
      useAppInitialization()
    })

    await waitFor(() => {
      expect(initializeMock).toHaveBeenCalledTimes(1)
    })
  })

  it('opens the auth modal when loading completes without an API key', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '', isApiKeyLoading: false })

    renderHook(() => {
      useAppInitialization()
    })

    await waitFor(() => {
      expect(setAuthModalOpenMock).toHaveBeenCalledWith(true)
    })
  })

  it('does not open the auth modal while loading', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '', isApiKeyLoading: true })

    renderHook(() => {
      useAppInitialization()
    })

    expect(setAuthModalOpenMock).not.toHaveBeenCalled()
  })

  it('does not open the auth modal when API key is present', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'present', isApiKeyLoading: false })

    renderHook(() => {
      useAppInitialization()
    })

    expect(setAuthModalOpenMock).not.toHaveBeenCalled()
  })
})
