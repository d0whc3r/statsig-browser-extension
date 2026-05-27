import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsForm } from './use-settings-form'

const { setLocalStorageKeyMock, setStorageTypeMock, useSettingsStorageMock, useUIStoreMock, setSettingsSheetOpenMock } =
  vi.hoisted(() => ({
    setLocalStorageKeyMock: vi.fn(),
    setSettingsSheetOpenMock: vi.fn(),
    setStorageTypeMock: vi.fn(),
    useSettingsStorageMock: vi.fn(),
    useUIStoreMock: vi.fn(),
  }))

vi.mock('@/src/hooks/use-settings-storage', () => ({
  useSettingsStorage: useSettingsStorageMock,
}))

vi.mock('@/src/store/use-ui-store', () => ({
  useUIStore: useUIStoreMock,
}))

describe('useSettingsForm', () => {
  beforeEach(() => {
    setLocalStorageKeyMock.mockReset()
    setStorageTypeMock.mockReset()
    setSettingsSheetOpenMock.mockReset()
    useSettingsStorageMock.mockReturnValue({
      localStorageValue: 'statsig_user',
      setLocalStorageKey: setLocalStorageKeyMock,
      setStorageType: setStorageTypeMock,
      storageType: 'localStorage',
    })
    useUIStoreMock.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        isSettingsSheetOpen: true,
        setSettingsSheetOpen: setSettingsSheetOpenMock,
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes the form with values from storage', () => {
    const { result } = renderHook(() => useSettingsForm())
    expect(result.current.form.getValues()).toStrictEqual({
      localStorageKey: 'statsig_user',
      storageType: 'localStorage',
    })
    expect(result.current.isSettingsSheetOpen).toBeTruthy()
  })

  it('falls back to defaults when storage values are empty', () => {
    useSettingsStorageMock.mockReturnValue({
      localStorageValue: '',
      setLocalStorageKey: setLocalStorageKeyMock,
      setStorageType: setStorageTypeMock,
      storageType: '',
    })
    const { result } = renderHook(() => useSettingsForm())
    expect(result.current.form.getValues()).toStrictEqual({
      localStorageKey: 'statsig_user',
      storageType: 'localStorage',
    })
  })

  it('handleSave persists values and closes the sheet on submit', async () => {
    const { result } = renderHook(() => useSettingsForm())

    act(() => {
      result.current.form.setValue('localStorageKey', 'custom_key')
      result.current.form.setValue('storageType', 'cookie')
    })

    act(() => {
      const event = { preventDefault: vi.fn() } as unknown as Parameters<typeof result.current.handleSave>[0]
      result.current.handleSave(event)
    })

    await waitFor(() => {
      expect(setLocalStorageKeyMock).toHaveBeenCalledWith('custom_key')
    })
    expect(setStorageTypeMock).toHaveBeenCalledWith('cookie')
    expect(setSettingsSheetOpenMock).toHaveBeenCalledWith(false)
  })

  it('handleSave does not submit when validation fails', () => {
    const { result } = renderHook(() => useSettingsForm())

    act(() => {
      result.current.form.setValue('localStorageKey', '')
    })

    act(() => {
      const event = { preventDefault: vi.fn() } as unknown as Parameters<typeof result.current.handleSave>[0]
      result.current.handleSave(event)
    })

    expect(setLocalStorageKeyMock).not.toHaveBeenCalled()
    expect(setStorageTypeMock).not.toHaveBeenCalled()
    expect(setSettingsSheetOpenMock).not.toHaveBeenCalled()
  })

  it('handleClose closes the sheet only when open becomes false', () => {
    const { result } = renderHook(() => useSettingsForm())

    act(() => {
      result.current.handleClose(true)
    })
    expect(setSettingsSheetOpenMock).not.toHaveBeenCalled()

    act(() => {
      result.current.handleClose(false)
    })
    expect(setSettingsSheetOpenMock).toHaveBeenCalledWith(false)
  })
})
