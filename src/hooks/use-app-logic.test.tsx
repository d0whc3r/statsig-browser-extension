import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { storage } from 'wxt/utils/storage'

import {
  DEFAULT_UI_PREFERENCES,
  UI_PREFERENCES_STORAGE_KEY,
  useUiPreferencesStore,
} from '@/src/store/use-ui-preferences-store'
import { useUIStore } from '@/src/store/use-ui-store'

import { useAppLogic } from './use-app-logic'

vi.mock('./use-app-initialization', () => ({
  useAppInitialization: vi.fn(),
}))

vi.mock('./use-detected-user', () => ({
  useDetectedUser: vi.fn(),
}))

vi.mock('./use-logout', () => ({
  useLogout: () => vi.fn(),
}))

describe('useAppLogic', () => {
  beforeEach(async () => {
    useUiPreferencesStore.setState({
      activeTab: DEFAULT_UI_PREFERENCES.activeTab,
      auditLogs: structuredClone(DEFAULT_UI_PREFERENCES.auditLogs),
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
    await storage.removeItem(UI_PREFERENCES_STORAGE_KEY)
    useUIStore.getState().reset()
  })

  it('persists the last visited tab and closes the item sheet', () => {
    useUIStore.getState().setCurrentItemId('gate_1')
    useUIStore.getState().setItemSheetOpen(true)

    const { result } = renderHook(() => useAppLogic())

    act(() => {
      result.current.handleTabChange('experiments')
    })

    expect(result.current.activeTab).toBe('experiments')
    expect(useUiPreferencesStore.getState().activeTab).toBe('experiments')
    expect(useUIStore.getState().isItemSheetOpen).toBeFalsy()
    expect(useUIStore.getState().currentItemId).toBeUndefined()
  })

  it('ignores unknown tab ids', () => {
    const { result } = renderHook(() => useAppLogic())

    act(() => {
      result.current.handleTabChange('not-a-tab')
    })

    expect(result.current.activeTab).toBe('feature_gates')
  })
})
