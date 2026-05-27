import type { WxtStorageItem } from 'wxt/utils/storage'

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWxtStorage } from './use-wxt-storage'

type Listener<T> = (value: T) => void

const createStorageItem = <T,>(initial: T, getValueImpl?: () => T | Promise<T>) => {
  const listeners: Listener<T>[] = []
  const item = {
    fallback: initial,
    getValue: vi.fn(getValueImpl ?? (() => initial)),
    setValue: vi.fn(async (_value: T) => {}),
    watch: vi.fn((cb: Listener<T>) => {
      listeners.push(cb)
      return () => {
        const idx = listeners.indexOf(cb)
        if (idx !== -1) {
          listeners.splice(idx, 1)
        }
      }
    }),
  }
  return {
    emit: (value: T) => {
      for (const listener of listeners) {
        listener(value)
      }
    },
    item: item as unknown as WxtStorageItem<T, Record<string, unknown>>,
    listeners,
  }
}

describe('useWxtStorage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with fallback and replaces with persisted value', async () => {
    const { item } = createStorageItem('fallback', () => 'stored')

    const { result } = renderHook(() => useWxtStorage(item))

    expect(result.current[0]).toBe('fallback')
    expect(result.current[2]).toBeTruthy()

    await waitFor(() => {
      expect(result.current[0]).toBe('stored')
      expect(result.current[2]).toBeFalsy()
    })
  })

  it('updates the value when the watcher emits', async () => {
    const { emit, item } = createStorageItem('a')
    const { result } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(result.current[2]).toBeFalsy()
    })

    act(() => {
      emit('b')
    })
    expect(result.current[0]).toBe('b')
  })

  it('logs and stops loading on getValue failure', async () => {
    const { item } = createStorageItem('fallback', () => {
      throw new Error('boom')
    })

    const { result } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(result.current[2]).toBeFalsy()
    })

    expect(result.current[0]).toBe('fallback')
    // oxlint-disable-next-line typescript/no-unsafe-call
    expect(console.error).toHaveBeenCalledWith('Failed to get storage value:', expect.any(Error))
  })

  it('persists new values via setValue', async () => {
    const { item } = createStorageItem('a')
    const { result } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(result.current[2]).toBeFalsy()
    })

    act(() => {
      result.current[1]('b')
    })

    expect(result.current[0]).toBe('b')
    expect(item.setValue).toHaveBeenCalledWith('b')
  })

  it('does not call setValue if value is unchanged', async () => {
    const { item } = createStorageItem('a')
    const { result } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(result.current[2]).toBeFalsy()
    })

    act(() => {
      result.current[1]('a')
    })

    expect(item.setValue).not.toHaveBeenCalled()
  })

  it('logs setValue failures without throwing', async () => {
    const { item } = createStorageItem('a')
    // oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-member-access
    ;(item.setValue as any).mockRejectedValue(new Error('store-failed'))

    const { result } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(result.current[2]).toBeFalsy()
    })

    act(() => {
      result.current[1]('b')
    })

    await waitFor(() => {
      // oxlint-disable-next-line typescript/no-unsafe-call
      expect(console.error).toHaveBeenCalledWith('Failed to set storage value:', expect.any(Error))
    })
  })

  it('unsubscribes the watcher on unmount', async () => {
    const { item, listeners } = createStorageItem('a')
    const { unmount } = renderHook(() => useWxtStorage(item))

    await waitFor(() => {
      expect(listeners).toHaveLength(1)
    })

    unmount()
    expect(listeners).toHaveLength(0)
  })
})
