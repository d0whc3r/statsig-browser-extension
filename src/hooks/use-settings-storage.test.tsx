import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsStorage } from './use-settings-storage'

const clearProjects = vi.fn()
const setLocalStorageKey = vi.fn()
const setStorageType = vi.fn()
const setTypeApiKey = vi.fn()
const setCurrentOverrides = vi.fn()
const useWxtStorage = vi.fn()
const useSettingsStore = vi.fn()

vi.mock('@/src/hooks/use-wxt-storage', () => ({
  useWxtStorage: (...args: unknown[]) => useWxtStorage(...args),
}))

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: () => useSettingsStore(),
}))

describe('useSettingsStorage', () => {
  beforeEach(() => {
    clearProjects.mockReset()
    setLocalStorageKey.mockReset()
    setStorageType.mockReset()
    setTypeApiKey.mockReset()
    setCurrentOverrides.mockReset()
    useSettingsStore.mockReturnValue({
      activeProjectId: 'p1',
      apiKey: 'console-key',
      clearProjects,
      isApiKeyLoading: false,
      projects: [],
    })
    useWxtStorage
      .mockReset()
      .mockReturnValueOnce(['statsig_user', setLocalStorageKey, false])
      .mockReturnValueOnce(['localStorage', setStorageType, false])
      .mockReturnValueOnce(['write-key', setTypeApiKey, false])
      .mockReturnValueOnce([[], setCurrentOverrides, false])
  })

  it('returns stored settings when the API key type is already write-key', () => {
    const { result } = renderHook(() => useSettingsStorage())

    expect(result.current.apiKey).toBe('console-key')
    expect(result.current.localStorageValue).toBe('statsig_user')
    expect(result.current.storageType).toBe('localStorage')
    expect(result.current.typeApiKey).toBe('write-key')
    expect(setTypeApiKey).not.toHaveBeenCalled()
  })

  it('forces typeApiKey back to write-key when it was stored as read-key', () => {
    useWxtStorage
      .mockReset()
      .mockReturnValueOnce(['statsig_user', setLocalStorageKey, false])
      .mockReturnValueOnce(['localStorage', setStorageType, false])
      .mockReturnValueOnce(['read-key', setTypeApiKey, false])
      .mockReturnValueOnce([[], setCurrentOverrides, false])

    renderHook(() => useSettingsStorage())
    expect(setTypeApiKey).toHaveBeenCalledWith('write-key')
  })

  it('reset clears the projects, local storage key, and overrides', async () => {
    const { result } = renderHook(() => useSettingsStorage())

    await act(async () => {
      await result.current.reset()
    })

    expect(clearProjects).toHaveBeenCalledWith()
    expect(setLocalStorageKey).toHaveBeenCalledWith('statsig_user')
    expect(setCurrentOverrides).toHaveBeenCalledWith([])
    expect(setStorageType).not.toHaveBeenCalled()
  })
})
