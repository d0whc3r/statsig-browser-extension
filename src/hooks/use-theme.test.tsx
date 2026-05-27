import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTheme } from './use-theme'

const { useWxtStorageMock } = vi.hoisted(() => ({
  useWxtStorageMock: vi.fn(),
}))

vi.mock('@/src/hooks/use-wxt-storage', () => ({
  useWxtStorage: useWxtStorageMock,
}))

vi.mock('@/src/lib/storage', () => ({
  themeStorage: {},
}))

type ChangeListener = () => void

const setupMatchMedia = (matches: boolean) => {
  const listeners: ChangeListener[] = []
  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn((_event: string, cb: ChangeListener) => listeners.push(cb)),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }))
  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    value: matchMedia,
    writable: true,
  })
  return { listeners }
}

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    useWxtStorageMock.mockReset()
  })

  afterEach(() => {
    document.documentElement.className = ''
  })

  it('applies the dark class when theme is dark', async () => {
    setupMatchMedia(false)
    const setTheme = vi.fn()
    useWxtStorageMock.mockReturnValue(['dark', setTheme, false])

    renderHook(() => useTheme())

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBeTruthy()
    })
    expect(document.documentElement.classList.contains('light')).toBeFalsy()
  })

  it('applies the light class when theme is light', async () => {
    setupMatchMedia(false)
    useWxtStorageMock.mockReturnValue(['light', vi.fn(), false])

    renderHook(() => useTheme())

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBeTruthy()
    })
  })

  it('applies the system preference when theme is system', async () => {
    setupMatchMedia(true)
    useWxtStorageMock.mockReturnValue(['system', vi.fn(), false])

    const { result } = renderHook(() => useTheme())

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBeTruthy()
    })
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('skips applying theme while storage is loading', () => {
    setupMatchMedia(false)
    useWxtStorageMock.mockReturnValue([undefined, vi.fn(), true])

    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains('light')).toBeFalsy()
    expect(document.documentElement.classList.contains('dark')).toBeFalsy()
  })

  it('exposes the resolvedTheme when theme is explicitly set', () => {
    setupMatchMedia(false)
    useWxtStorageMock.mockReturnValue(['light', vi.fn(), false])

    const { result } = renderHook(() => useTheme())

    expect(result.current.resolvedTheme).toBe('light')
  })

  it('delegates setTheme to the storage setter', () => {
    setupMatchMedia(false)
    const setTheme = vi.fn()
    useWxtStorageMock.mockReturnValue(['light', setTheme, false])

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
