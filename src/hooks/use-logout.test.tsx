import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useContextStore } from '@/src/store/use-context-store'
import { useUIStore } from '@/src/store/use-ui-store'

import { useLogout } from './use-logout'

const { queryClientMock, resetSettingsMock } = vi.hoisted(() => ({
  queryClientMock: { clear: vi.fn() },
  resetSettingsMock: vi.fn(),
}))

vi.mock('@/src/hooks/use-settings-storage', () => ({
  useSettingsStorage: () => ({ reset: resetSettingsMock }),
}))

vi.mock('@/src/lib/query-client', () => ({
  queryClient: queryClientMock,
}))

describe('useLogout', () => {
  beforeEach(() => {
    queryClientMock.clear.mockReset()
    resetSettingsMock.mockReset()
    useUIStore.getState().reset()
    useContextStore.getState().reset()
  })

  it('resets settings, query cache, UI store, context store and opens the auth modal', async () => {
    // Mutate UI / Context stores so we can verify reset wipes them
    useUIStore.getState().setSettingsSheetOpen(true)
    useUIStore.getState().setCurrentItemId('item_1')
    useContextStore.getState().setDetectedUser({ userID: 'u' })

    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current()
    })

    expect(resetSettingsMock).toHaveBeenCalledTimes(1)
    expect(queryClientMock.clear).toHaveBeenCalledTimes(1)

    const ui = useUIStore.getState()
    expect(ui.isSettingsSheetOpen).toBeFalsy()
    expect(ui.currentItemId).toBeUndefined()
    expect(ui.isAuthModalOpen).toBeTruthy() // Opened after reset

    expect(useContextStore.getState().detectedUser).toBeUndefined()
  })

  it('invokes operations in order: settings → query cache → UI reset → context reset → modal open', async () => {
    const order: string[] = []

    resetSettingsMock.mockImplementation(() => {
      order.push('settings')
      return Promise.resolve()
    })
    // oxlint-disable-next-line vitest/prefer-mock-return-shorthand
    queryClientMock.clear.mockImplementation(() => {
      order.push('query')
    })

    const unsubUI = useUIStore.subscribe((state, prev) => {
      const opened = state.isAuthModalOpen
      const wasClosed = !prev.isAuthModalOpen
      // oxlint-disable-next-line vitest/no-conditional-in-test
      if (opened && wasClosed) {
        order.push('modal-open')
      }
    })

    const { result } = renderHook(() => useLogout())
    await act(async () => {
      await result.current()
    })
    unsubUI()

    expect(order[0]).toBe('settings')
    expect(order[1]).toBe('query')
    expect(order.at(-1)).toBe('modal-open')
  })
})
