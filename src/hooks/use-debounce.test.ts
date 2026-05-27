import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 200))
    expect(result.current).toBe('initial')
  })

  it('debounces updates by the given delay', () => {
    const { rerender, result } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    })
    expect(result.current).toBe('a')

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')
  })

  it('cancels the pending update when the value changes again', () => {
    const { rerender, result } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('c')
  })

  it('clears the timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('responds to delay changes by resetting the timer', () => {
    const { rerender, result } = renderHook(({ delay, value }) => useDebounce(value, delay), {
      initialProps: { delay: 500, value: 'a' },
    })
    rerender({ delay: 500, value: 'b' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ delay: 50, value: 'b' })
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current).toBe('b')
  })
})
